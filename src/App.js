import React from "react";
import "./App.css";

const App = () => {
  const [filename, setFilename] = React.useState("Choose File");
  // Handler for uploading files:
  const fileChooserHandler = (event) => {
    let file = event.target.files && event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      var files = new Blob([reader.result], { type: "application/pdf" });
      files.text().then((x) => {
        console.log("isEncrypted", x.includes("Encrypt"));
        alert("check console");
        console.log(
          "isEncrypted",
          x
            .substring(x.lastIndexOf("<<"), x.lastIndexOf(">>"))
            .includes("/Encrypt")
        );
        console.log(file.name);
        setFilename(file.name);
      });
    };
  };

  return (
    <>
      <div className="pdfMainDiv">
        <div className="pdfSubDiv">
          <p className="payslipMainHeader">Upload your Pdf File here</p>
          <div className="inputsDiv">
            <p className="monthHeading"></p>
            <label className="labelpdf">
              <p>{filename}</p>
              <input
                className="fileInput"
                id="inputTag"
                type="file"
                accept="application/pdf"
                onChange={fileChooserHandler}
              />
            </label>
          </div>

          <button className="continueButtonPdf">CONTINUE</button>
        </div>
      </div>
    </>
  );
};

export default App;
