import { useState } from "react";
import { useForm } from "react-hook-form";

type Inputs = {
    name: string;
    email: string;
}

const ROLES = ["Leader", "Captain", "Elder", "Children"];

function HookForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitSuccessful, isSubmitting },
        getValues
    } = useForm<Inputs>({ defaultValues: { name: "karma", email: "a@gmail.com" }, mode: "onTouched"}); //here mode is used to configure validation stratergy like validate after submit after change etc

    // this function to tell what to do after submit like we need to display the data or send it to backend etc
    function submit(data) {
        return new Promise((res) => { 
            console.log(data);
            setTimeout(res, 1000);
        });
    }

    console.log(watch("name"));
    console.log(watch("email"));

    if(isSubmitSuccessful) {
        return (
            <div>
                <h1>Form submitted successfully</h1>
            </div>
        )
    }
    return (
        <div>
            {/* here handleSubmit is a higher order function in which we pass the function that will handle what to do after form is submitted */}
            {/* not the handleSubmit will pass the data in submit function it self */}
            <form onSubmit={handleSubmit(submit)}>
                <label>
                    Full name
                    <input {...register('name', { required: 'name is required' })} /> 
                    {/* this is how we pass the field (here name) and the validations for that field */}
                    {errors.name && <span>{errors.name.message}</span>}
                </label>

                <label>
                    Email
                    <input {...register('email', { required: 'email is required' })} />
                    {errors.email && <span>{errors.email.message}</span>}
                </label>

                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting....." : "Submit"}</button>
            </form>
        </div>
    );
}

export default HookForm;