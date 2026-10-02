import * as React from 'react';

export interface User {
    data: {
      cell: string;
      dob: {
        age: number;
        date: string;
      };
      email: string;
      gender: string;
      id: number;
      location: {
        city: string;
        coordinates: {
          latitude: string;
          longitude: string;
        };
        country: string;
        postcode: number;
        state: string;
        street: {
          name: string;
          number: number;
        };
        timezone: {
          description: string;
          offset: string;
        };
      };
      login: {
        md5: string;
        password: string;
        salt: string;
        sha1: string;
        sha256: string;
        username: string;
        uuid: string;
      };
      name: {
        first: string;
        last: string;
        title: string;
      };
      nat: string;
      phone: string;
      picture: {
        large: string;
        medium: string;
        thumbnail: string;
      };
      registered: {
        age: number;
        date: string;
      };
    };
    message: string;
    statusCode: number;
    success: boolean;
}

export function useRandomUser() {
    const [user, setUser] = React.useState<User['data'] | null>();
    const [isFetching, setIsFetching] = React.useState<boolean>(false);
    const [error, setError] = React.useState<null | string>(null);

    async function fetchUser() {
         try {
            setError(null);
            setIsFetching(true);
            const rawResponse = await fetch('https://api.freeapi.app/api/v1/public/randomusers/user/random', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const response = await rawResponse.json() as User;
            if(response.data && response.success) setUser(response.data);
         } catch (error) {
            console.error(error);
            setError('Failed to fetch user');
         } finally {
            setIsFetching(false);
         }
    }

    return { user, fetchUser, isFetching, error };
}