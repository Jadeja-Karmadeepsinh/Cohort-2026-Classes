import React from "https://esm.sh/react@19.0.0";
import ReactDOM from "https://esm.sh/react-dom@19.0.0/client";

const App = () => {
    return React.createElement(
        "div",
        {
            className: "container"
        },
        React.createElement(
            "h1",
            null,
            "Hello React"
        )
    );
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));

// const App = () => {
//     return React.createElement(
//         "div",
//         {
//             className: "container"
//         },
//         [
//             React.createElement(
//                 "h1",
//                 null,
//                 "Hello React"
//             ),

//             React.createElement(
//                 "h1",
//                 null,
//                 "Second Element"
//             ),
//         ]
//     );
// }


//! Here if we have to pass many chidlrens in .createElement method we need to pass them in array
//! if we want only 1 children we pass it directly
//! We can also add a new elemenet as a children also