import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
    const location = useLocation();

    useEffect(() => {
        if (window.umami) {
            const currentPath = location.pathname;
            const trackPath = currentPath.startsWith('/learn-kana')
                ? currentPath
                : `/learn-kana${currentPath === '/' ? '' : currentPath}`;

            window.umami.track(props => ({
                ...props,
                url: trackPath
            }));
        }
    }, [location]);

    return (
        <>
            <ThemeToggle />
            <Outlet />
        </>
    );
}
