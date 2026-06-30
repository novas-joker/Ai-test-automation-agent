"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Provider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [userDetail, setUserDetail] = useState<any>();
    useEffect(() => {
        CreateNewUsers();
    }, []);

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