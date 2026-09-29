import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { authService } from "../services/authService.js";
import "./HookForm.css";

function HookForm() {

    const navigate = useNavigate();

    const [mode, setMode] = useState("login");
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: ""
        },
        mode: "onTouched"
    });


    function switchMode(newMode) {

        setMode(newMode);

        setServerError("");

        setShowPassword(false);

        reset({
            name: "",
            email: "",
            password: ""
        });
    }


    async function submit(data) {

        setServerError("");

        try {

            if (mode === "register") {

                const params = {
                    name: data.name,
                    email: data.email,
                    password: data.password
                };

                // TODO:
                // Call your /register API here.
                // You already implemented this in authService.register().
                const res = await authService.register(params);

                console.log("Register response:", res);

                // After registration, switch user to Login.
                switchMode("login");

                return;
            }


            if (mode === "login") {

                const params = {
                    email: data.email,
                    password: data.password
                };

                // TODO:
                // Call your /login API here.
                const res = await authService.login(params);

                console.log("Login response:", res);

                // Login successful -> go to Profile.
                navigate({
                    to: "/Profile"
                });
            }

        } catch (error) {

            console.error(error);

            setServerError(
                error?.message || "Something went wrong. Please try again."
            );
        }
    }


    return (
        <div className="auth-page">

            <div className="auth-background-glow glow-one"></div>
            <div className="auth-background-glow glow-two"></div>

            <div className="auth-container">

                {/* Logo */}

                <div className="auth-header">

                    <div className="auth-logo">
                        A
                    </div>

                    <h1>
                        {mode === "login"
                            ? "Welcome back"
                            : "Create your account"
                        }
                    </h1>

                    <p>
                        {mode === "login"
                            ? "Sign in to continue to your account"
                            : "Join us and create your account"
                        }
                    </p>

                </div>


                {/* Card */}

                <div className="auth-card">

                    {/* Login / Register switch */}

                    <div className="auth-tabs">

                        <button
                            type="button"
                            className={mode === "login" ? "active" : ""}
                            onClick={() => switchMode("login")}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={mode === "register" ? "active" : ""}
                            onClick={() => switchMode("register")}
                        >
                            Register
                        </button>

                    </div>


                    {/* Server error */}

                    {serverError && (

                        <div className="server-error">
                            {serverError}
                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit(submit)}
                        className="auth-form"
                    >

                        {/* Name */}

                        {mode === "register" && (

                            <div className="form-group">

                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    {...register("name", {
                                        required: "Name is required",
                                        minLength: {
                                            value: 5,
                                            message: "Name must be at least 5 characters"
                                        }
                                    })}
                                    className={errors.name ? "input-error" : ""}
                                />

                                {errors.name && (
                                    <span className="field-error">
                                        {errors.name.message}
                                    </span>
                                )}

                            </div>

                        )}


                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address"
                                    }
                                })}
                                className={errors.email ? "input-error" : ""}
                            />

                            {errors.email && (
                                <span className="field-error">
                                    {errors.email.message}
                                </span>
                            )}

                        </div>


                        {/* Password */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                    className={errors.password ? "input-error" : ""}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                            {errors.password && (
                                <span className="field-error">
                                    {errors.password.message}
                                </span>
                            )}

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="submit-button"
                        >

                            {isSubmitting
                                ? "Please wait..."
                                : mode === "login"
                                    ? "Sign In"
                                    : "Create Account"
                            }

                        </button>

                    </form>


                    {/* Switch */}

                    <div className="auth-switch">

                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"
                        }

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(
                                    mode === "login"
                                        ? "register"
                                        : "login"
                                )
                            }
                        >
                            {mode === "login"
                                ? "Create one"
                                : "Sign in"
                            }
                        </button>

                    </div>

                </div>


                <p className="auth-footer">
                    Secure authentication powered by your backend
                </p>

            </div>

        </div>
    );
}

export default HookForm;