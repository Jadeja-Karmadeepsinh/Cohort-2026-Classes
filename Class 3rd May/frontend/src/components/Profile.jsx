import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authService } from "../services/authService.js";

import "./Profile.css"

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadProfile() {

            try {

                setLoading(true);
                setError("");

                // TODO:
                // Call your GET /profile API inside authService.getProfile()
                const res = await authService.getProfile();

                setUser(res.user);

            } catch (error) {

                console.error(error);

                setError(
                    error?.message || "Unable to load profile."
                );

            } finally {

                setLoading(false);

            }
        }

        loadProfile();

    }, []);


    async function handleLogout() {

        try {

            // TODO:
            // Call your POST /logout API inside authService.logout()
            await authService.logout();

            navigate({
                to: "/HookForm"
            });

        } catch (error) {

            console.error(error);

            setError(
                error?.message || "Logout failed."
            );
        }
    }


    if (loading) {

        return (
            <div className="profile-page">

                <div className="profile-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your profile...
                    </p>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="profile-page">

                <div className="profile-error-card">

                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Something went wrong
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() => navigate({ to: "/HookForm" })}
                    >
                        Back to Login
                    </button>

                </div>

            </div>
        );
    }


    if (!user) {
        return null;
    }


    const initials = user.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();


    const createdDate = new Date(user.created_at);


    return (
        <div className="profile-page">

            <div className="profile-container">

                {/* Header */}

                <div className="profile-header">

                    <div>

                        <div className="profile-eyebrow">
                            ACCOUNT
                        </div>

                        <h1>
                            Your Profile
                        </h1>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>


                {/* Profile Card */}

                <div className="profile-card">

                    <div className="profile-banner"></div>


                    <div className="profile-content">

                        {/* Avatar */}

                        <div className="profile-avatar">
                            {initials}
                        </div>


                        <div className="profile-name-section">

                            <h2>
                                {user.name}
                            </h2>

                            <p>
                                {user.email}
                            </p>

                        </div>


                        {/* Details */}

                        <div className="profile-details">

                            <div className="profile-detail">

                                <span>
                                    USER ID
                                </span>

                                <strong className="user-id">
                                    {user.id}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    MEMBER SINCE
                                </span>

                                <strong>
                                    {createdDate.toLocaleDateString(
                                        undefined,
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        }
                                    )}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    EMAIL
                                </span>

                                <strong>
                                    {user.email}
                                </strong>

                            </div>


                            <div className="profile-detail">

                                <span>
                                    ACCOUNT STATUS
                                </span>

                                <strong className="status">
                                    <i></i>
                                    Active
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                <p className="profile-footer">
                    Your account information is securely loaded from the backend.
                </p>

            </div>

        </div>
    );
}

export default Profile;