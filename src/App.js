import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [uploadBankStatement, setuploadBankStatement] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [wrongPasswordError, setWrongPasswordError] = useState(false);

  // Handler for uploading files:
  const fileChooserHandler = (event) => {
    let file = event.target.files && event.target.files[0];
    if (file) {
      setuploadBankStatement(file);
      checkEncryption(file);
    }
    if (error) setError(false);
  };

  const checkEncryption = (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      var files = new Blob([reader.result], { type: "application/pdf" });
      files.text().then((x) => {
        if (
          x.includes("Encrypt") ||
          x
            .substring(x.lastIndexOf("<<"), x.lastIndexOf(">>"))
            .includes("/Encrypt")
        ) {
          setShowPassword(true);
          setPassword("");
          setPasswordError(false);
        } else {
          setShowPassword(false);
          setPassword("");
          setPasswordError(false);
        }
      });
    };
  };

  // Input Handler:
  const onChangeHandler = (event) => {
    setPassword(event.target.value);
    if (passwordError) {
      setPasswordError(false);
    }
    if (wrongPasswordError) {
      setWrongPasswordError(false);
    }
  };

  // Handler for validation
  const validation = () => {
    if (!uploadBankStatement) {
      return setError(true);
    } else {
      if (showPassword) {
        if (!password) {
          return setPasswordError(true);
        }
      } else {
        console.log("pdf without password ", uploadBankStatement);
        alert("pdf without password uploaded in console", uploadBankStatement);
        return;
      }
    }
    checkPassword();
  };

  // Handler for checking the password is valid or not:
  const checkPassword = () => {
    let url = URL.createObjectURL(uploadBankStatement);
    window.pdfjsLib
      .getDocument({
        url: url,
        password: password,
      })
      .then(() => {
        console.log("pdf with password ", uploadBankStatement);
        alert("pdf with password uploaded in console", uploadBankStatement);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        setWrongPasswordError(true);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <>
      <div className="pdfMainDiv">
        <div className="pdfSubDiv">
          <p className="payslipMainHeader">Upload your PDF Document</p>
          <div className="inputsDiv">
            <label className="labelpdf">
              {uploadBankStatement ? uploadBankStatement.name : "Choose file"}
              <input
                className="fileInput"
                id="inputTag"
                type="file"
                accept="application/pdf"
                onChange={fileChooserHandler}
              />
            </label>
            {error && (
              <p className="errorText">Please upload your Bank Statement</p>
            )}
            {showPassword && (
              <>
                <p className="passwordHeading">
                  This file is password protected
                </p>
                <div className="customInputBlock removeMarginForInput">
                  <input
                    type="password"
                    name="paySlipOne"
                    value={password}
                    required
                    spellCheck="false"
                    autoComplete="off"
                    onChange={onChangeHandler}
                  />
                  <span className="customPlaceholder">Password</span>

                  {passwordError && (
                    <p className="errorText">Please enter the password</p>
                  )}
                  {wrongPasswordError && (
                    <p className="errorText">Please enter correct password</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="btnMainDiv">
          <button className="customButton" onClick={validation}>
            CONTINUE
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
