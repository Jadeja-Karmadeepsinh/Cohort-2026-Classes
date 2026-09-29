function FormSubmitting() {

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">

            <div className="text-center">

                <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-5" />

                <h2 className="text-lg font-semibold text-white">
                    Please wait...
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                    Processing your request
                </p>

            </div>

        </div>
    );
}

export default FormSubmitting;