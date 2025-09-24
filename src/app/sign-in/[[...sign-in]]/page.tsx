import CustomSignIn from '@/components/CustomSignIn';

export default function Page() {
  return (
    <div className="h-screen flex">
      <div className="flex-1 bg-blue-600"></div>
      <div className="flex-1 h-full">
        <CustomSignIn />
      </div>
    </div>
  );
}