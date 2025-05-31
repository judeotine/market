'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StepProgress } from '@/components/ui/step-progress';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { userSignal } from '@/store';
import { supabase } from '@/lib/supabase';
import { Shop, Profile } from '@/types/types';

const shopSchema = z.object({
  // Step 1: Profile Details
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  avatar: z.string().url('Invalid profile image URL'),
  
  // Step 2: Shop Details
  shopName: z.string().min(3, 'Shop name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  logo: z.string().url('Invalid logo URL'),
  
  // Step 3: Business Details
  businessType: z.string().min(2, 'Business type is required'),
  businessName: z.string().min(3, 'Business name is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type FormData = z.infer<typeof shopSchema>;

const INITIAL_FORM_DATA: FormData = {
  name: '',
  phone: '',
  avatar: '',
  shopName: '',
  description: '',
  location: '',
  logo: '',
  businessType: '',
  businessName: '',
  bio: '',
};

const steps = [
  {
    title: 'Profile Details',
    description: 'Set up your personal profile',
    fields: ['name', 'phone', 'avatar'],
  },
  {
    title: 'Shop Details',
    description: 'Create your shop presence',
    fields: ['shopName', 'description', 'location', 'logo'],
  },
  {
    title: 'Business Details',
    description: 'Add your business information',
    fields: ['businessType', 'businessName', 'bio'],
  },
];

export function CreateShopForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const user = userSignal.value;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = (step: number) => {
    const stepFields = steps[step].fields;
    const stepData = Object.fromEntries(
      Object.entries(formData).filter(([key]) => stepFields.includes(key))
    );
    
    try {
      const fieldsToValidate = stepFields.reduce((acc, field) => {
        acc[field as keyof FormData] = true;
        return acc;
      }, {} as { [K in keyof FormData]?: true });

      shopSchema.pick(fieldsToValidate).parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error(authError?.message || 'User not authenticated');
      }

      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      let userProfile;
      
      if (fetchError || !existingProfile) {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.id,
            name: formData.name,
            phone: formData.phone,
            avatar: formData.avatar,
            user_type: 'shop_owner',
            is_active: true,
            trial_ads_count: 3,
            is_banned: false,
            other: {
              businessType: formData.businessType,
              businessName: formData.businessName,
              bio: formData.bio,
            },
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        userProfile = newProfile;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            phone: formData.phone,
            avatar: formData.avatar,
            user_type: 'shop_owner',
            is_active: true,
            other: {
              ...(existingProfile.other || {}),
              businessType: formData.businessType,
              businessName: formData.businessName,
              bio: formData.bio,
            },
          })
          .eq('user_id', authUser.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
        
        // Use the existing profile data since we know it was updated
        userProfile = {
          ...existingProfile,
          name: formData.name,
          phone: formData.phone,
          avatar: formData.avatar,
          user_type: 'shop_owner',
          is_active: true,
          other: {
            ...(existingProfile.other || {}),
            businessType: formData.businessType,
            businessName: formData.businessName,
            bio: formData.bio,
          },
        };
      }

      if (!userProfile) {
        throw new Error('Failed to create or update profile');
      }

      // Create shop using the create_shop function to bypass RLS
      const { data: shopId, error: shopError } = await supabase.rpc('create_shop', {
        shop_data: {
          name: formData.shopName,
          description: formData.description,
          profile_id: userProfile.profile_id,
          logo: formData.logo,
          rating: '0',
          ads_count: 0,
          ads_duration: 30,
          ads_duration_units: 'days',
          price_per_ad: 1000,
          price_currency: 'UGX',
          other: {
            location: formData.location,
          }
        }
      });

      if (shopError) {
        console.error('Error creating shop:', shopError);
        throw shopError;
      }

      // Fetch the created shop to get all its data
      const { data: createdShop, error: fetchShopError } = await supabase
        .from('shops')
        .select('*')
        .eq('shop_id', shopId)
        .single();

      if (fetchShopError) {
        console.error('Error fetching created shop:', fetchShopError);
        throw fetchShopError;
      }

      console.log('Created shop:', createdShop);
      
      if (!createdShop?.shop_id) {
        throw new Error('Failed to create shop: No shop ID returned');
      }

      if (createdShop?.shop_id) {
        toast.success('Shop created successfully!');
        // Redirect to the new shop's page
        router.push(`/shop/${createdShop.shop_id}`);
      } else {
        throw new Error('Failed to retrieve created shop data');
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error('Failed to create shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-6">Create Your Shop</CardTitle>
          <StepProgress steps={steps} currentStep={currentStep} />
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="avatar" className="text-sm font-medium">
                    Profile Image URL
                  </label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    required
                    value={formData.avatar}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="shopName" className="text-sm font-medium">
                    Shop Name
                  </label>
                  <Input
                    id="shopName"
                    name="shopName"
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Shop Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="logo" className="text-sm font-medium">
                    Shop Logo URL
                  </label>
                  <Input
                    id="logo"
                    name="logo"
                    type="url"
                    required
                    value={formData.logo}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <label htmlFor="businessType" className="text-sm font-medium">
                    Business Type
                  </label>
                  <Input
                    id="businessType"
                    name="businessType"
                    type="text"
                    required
                    value={formData.businessType}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="businessName" className="text-sm font-medium">
                    Business Name
                  </label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Business Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    required
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Shop...' : 'Create Shop'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 p-4 bg-slate-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Shop Details:</h3>
        <p>Free Trial: 3 ads</p>
        <p>Price per ad: 1000 UGX</p>
        <p>Ad duration: 30 days</p>
        <p className="mt-2 text-sm text-gray-600">
          * After your free trial, you'll need to pay for additional ads
        </p>
      </div>
    </div>
  );
}
