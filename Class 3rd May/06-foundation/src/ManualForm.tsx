import { useState } from "react";

const ROLES = ["Leader", "Captain", "Elder", "Children"]

function ManualForm() {
    const [values, setValues] = useState({
        name: "",
        email: "",
        role: "children",
        exp: ""
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    function set(field) {
        return (e) => setValues((value) => ({ ...values, [field]: e.target.value }));
    }

    function validate(val) {
        const error = {};
        if(!val.name.trim()) error.name = "name is required";
        if(!val.email.toLowerCase().includes("@")) error.email = "email is required";
        // if(!val.role.trim()) error.name = "role is required";
        // if (!val.exp.trim()) error.name = "experience is required";

        return error;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const error = validate(values);
        if(error) setErrors(error);
        if(Object.keys(error).length === 0) setSubmitted(true);
    }

    if(submitted) {
        // do a fetch call before showing form submitted
        return (
            <div>
                <h1>Form submitted successfully {values.name}</h1>
            </div>
        )
    }

    return (
        <div>
            <form onSubmit={handleSubmit} noValidate>
                <label>
                    Full Name
                    <input type="text" value={values.name} onChange={set('name')} />
                    {errors.name && <span>{errors.name}</span>}
                </label>

                <label>
                    Email
                    <input type="text" value={values.email} onChange={set('email')} />
                    {errors.email && <span>{errors.name}</span>}
                </label>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default ManualForm;