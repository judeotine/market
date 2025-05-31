// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { mockProfiles, mockUsers } from '@/types/types';
// import Image from 'next/image';

// export default function ProfilePage() {
//   // For demonstration, we'll use the first profile
//   const profile = mockProfiles[0];
//   const user = mockUsers.find((u) => u.id === profile.user_id);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-amber-600 mb-6">Your Profile</h1>
//       <Card>
//         <CardHeader>
//           <CardTitle>Personal Information</CardTitle>
//         </CardHeader>
//         <CardContent className="flex items-start space-x-6">
//           <Image
//             src={profile.avatar || '/placeholder.svg'}
//             alt={profile.name}
//             width={100}
//             height={100}
//             className="rounded-full"
//           />
//           <div>
//             <p>
//               <strong>Name:</strong> {profile.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {user?.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {user?.phone}
//             </p>
//             <p>
//               <strong>Trial Ads Remaining:</strong> {profile.trial_ads_count}
//             </p>
//             <p>
//               <strong>Account Status:</strong>{' '}
//               {profile.is_active ? 'Active' : 'Inactive'}
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
