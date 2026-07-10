"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

function Provider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, isLoaded } = useUser();
    const [userDetail, setUserDetail] = useState<any>();
    
    // Only create user when user is signed in
    useEffect(() => {
        if (isLoaded && user) {
            CreateNewUsers();
        }
    }, [user, isLoaded]);

    // Listen for user changes (sign out / sign in)
    useEffect(() => {
        if (isLoaded && user) {
            // User is logged in, ensure GitHub status is refreshed
            window.dispatchEvent(new Event('user-changed'));
        } else if (isLoaded && !user) {
            // User signed out, trigger cleanup
            window.dispatchEvent(new Event('user-signed-out'));
            setUserDetail(null);
        }
    }, [user, isLoaded]);

    const CreateNewUsers = async () => {
        try {
            const result = await axios.post('/api/users', {});
            setUserDetail(result.data.user);
        } catch (e) {
            console.error('Axios error:', e);
        }
    }
    return (
        <UserDetailsContext.Provider value={{ userDetail, setUserDetail }}>
            <div>
                {children}
            </div>
        </UserDetailsContext.Provider>
    )
}

export default Provider