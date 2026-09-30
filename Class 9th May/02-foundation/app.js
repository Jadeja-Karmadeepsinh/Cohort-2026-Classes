import React from "https://esm.sh/react@19.0.0";
import ReactDOM from "https://esm.sh/react-dom@19.0.0/client";

const Chai = (props) => {
    return React.createElement(
        "div",
        {},
        [
            React.createElement("h1", null, props.name || "Hello Chai"),
            React.createElement("p", null, props.text || "This is sample prop text")
        ]
    );
}

const App = () => {
    return React.createElement(
        "div",
        {
            className: "container"
        },
        [
            React.createElement(
                "h1",
                null,
                "Hello React"
            ),
            React.createElement(
                Chai, 
                // null, 
                {
                    name: "This prop name is chai",
                    text: "The given prop text is this"
                }
            ),
        ],
    );
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));