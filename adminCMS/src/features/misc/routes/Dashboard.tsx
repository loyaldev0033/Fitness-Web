import { ContentLayout } from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { ROLES } from '@/lib/authorization';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ContentLayout title="Dashboard">
      <h1 className="text-xl mt-2">Welcome {user?.email}</h1>
      <h4 className="my-3">
        Your role is : <b>{user?.role}</b>
      </h4>
      <p className="font-medium">Your current permissions:</p>
      {user?.role === ROLES.USER && (
        <ul className="my-4 list-inside list-disc">
          <li>Tag management</li>
        </ul>
      )}
      {user?.role === ROLES.ADMIN && (
        <ul className="my-4 list-inside list-disc">
          <li>Intro Video management</li>
          <li>User management</li>
          <li>Quiz management</li>
          <li>Tag management</li>
          <li>Category management</li>
          <li>Collection management</li>
          <li>Exercise management</li>
          <li>Shop Equipment management</li>
        </ul>
      )}
    </ContentLayout>
  );
};
