import HttpClient from '../apis/HttpClient';
import { UserService } from '../apis/UserService';
import { useQuery } from '@tanstack/react-query';

const useUser = () => {
  const httpClient = new HttpClient();
  const users = new UserService(httpClient);

  const { data: nicknameQuery, isLoading, error } = useQuery({
    queryFn: () => users.getRandomNickname(),
    queryKey: ['userId'],
  });
  return { nicknameQuery, isLoading, error };
};

export default useUser;
