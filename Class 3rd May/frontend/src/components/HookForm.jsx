import { useForm } from "react-hook-form"
import SubmitSuccessful from "./SubmitSuccessful.jsx";
import FormSubmitting from "./FormSubmitting.jsx";
import { authService } from "../services/authService.js";

function HookForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitSuccessful, isSubmitting, isSubmitted },
    } = useForm({ defaultValues: { name: "Steve", email: "steve@avengers.com", password: "steve@123456" }, mode: "onTouched" });

    //TODO: send data to backend
    async function submit(data) {
        const params = {
            name: data.name,
            email: data.email,
            password: data.password
        }
        const res = await authService.register(params);
        console.log(res);
    }

    // console.log(watch("name"));
    // console.log(watch("email"));
    // console.log(watch("password"));

    if(isSubmitting) {
        return (
            <FormSubmitting />
        )
    }

    if(isSubmitSuccessful) {
        return (
            <SubmitSuccessful />
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit(submit)}>
                <label>
                    Name
                    <input type="text" {...register('name', { required: "Name is required" })} />
                    {errors.name && <span>{errors.name.message}</span>}
                </label>

                <label>
                    Email
                    <input type="email" {...register('email', { required: "Email is required" })} />
                    {errors.email && <span>{errors.email.message}</span>}
                </label>

                <label>
                    Password
                    <input type="password" {...register('password', { required: "Password is required" })} />
                    {errors.password && <span>{errors.password.message}</span>}
                </label>

                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting....." : "Submit"}</button>
            </form>
        </>
    );
}

export default HookForm;