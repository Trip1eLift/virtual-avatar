/**
 * This is a react component meant to pull display About from the 
 * readme as a JSX Modal.
 * 
 * Module requirements:
 * 1. React
 * 2. marked
 * 
 * Author: Joseph Chang
 */

import * as React from 'react';
import { marked } from 'marked';

export default function About({open, setOpen}) {
  const [aboutText, setAboutText] = React.useState("");
  function handleClose(e) {
    setOpen(false);
  }

  React.useEffect(() => {
    fetch("https://raw.githubusercontent.com/Trip1eLift/About/main/README.md")
      .then(async (response) => {
        const data = await response.text();
        console.log(data);
        setAboutText(data);
      });
  }, []);

  const style = {
    visibility: open ? "visible" : "hidden",
    position: 'absolute',
    backgroundColor: "white",
    color: "black",
    top: "10vh",
    height: "80vh",
    left: "10%",
    width: "80%",
    overflow: "scroll",
    zIndex: "2",
    padding: "5%",
    paddingTop: "5vh",
    paddingBottom: "5vh",
    margin: "0",
    border: '2px solid #000',
  }

  const filterStyle = {
    visibility: open ? "visible" : "hidden",
    position: 'fixed',
    backgroundColor: "black",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    opacity: "0.7",
    zIndex: "1"
  }

  return (
    <>
      <div style={filterStyle} onClick={handleClose}></div>
      <div style={style} onClick={handleClose} dangerouslySetInnerHTML={{ __html: marked.parse(aboutText) }} />
    </>  
  );
}