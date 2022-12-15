import React, { useState, useEffect } from "react";
import "./upload.scss";
import UploadImage from "../../../../assets/img/upload.svg";
import { baseURL } from "../../../../redux/utils/ApiRequestPaths";
import { tokenConfig } from "../../../../redux/utils/Configuration";
import { DefaultLoading } from "../../../../reusableComponents/DefaultLoading";
import _ as Navigator from "../../../../routing/Navigator";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {
ToastsContainer,
ToastsContainerPosition,
ToastsStore,
} from "react-toasts";
import { ToastMessageHandler } from "../../../Stage2/SourceOfIncome/Validator";
import _ as localStorageValues from "../../../utils/localStorageValues";
import ToastMessage from "../../../../reusableComponents/Toast/ToastMessage";
import TopHeaderEight from "../../../../reusableComponents/TopHeader/TopHeaderEight";
import showIcon from "../../../../assets/img/ShowIcon.svg";
import hideIcon from "../../../../assets/img/HideIcon.svg";

const UploadBankStatement = (props) => {
let history = useHistory();
const { ToastContainerComp, showToast, clearWaitingQueue } = props;

const [uploadBankStatement, setuploadBankStatement] = useState(null);
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [base64Image, setBase64Image] = useState(null);
const [error, setError] = useState(false);
const [passwordError, setPasswordError] = useState(false);
const [wrongPasswordError, setWrongPasswordError] = useState(false);
const [apiDetails, setApiDetails] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [hidePassword, setHidePassword] = useState(true);

useEffect(() => {
window.addEventListener("HandleNativeBackPress", callBack);
return () => {
window.removeEventListener("HandleNativeBackPress", callBack);
};
}, []);

const callBack = () => {
history.goBack();
};

// Handler for uploading files:
const fileChooserHandler = (event) => {
let file = event.target.files && event.target.files[0];
if (file) {
setuploadBankStatement(file);
generateBase64(file);
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
setHidePassword(true);
} else {
setShowPassword(false);
setPassword("");
setPasswordError(false);
setHidePassword(true);
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

const handleShowPassword = () => {
setHidePassword(!hidePassword);
};

// handler for generating base64 code:
const generateBase64 = (file) => {
const reader = new FileReader();
reader.onloadend = () => {
const base64String = reader.result
.replace("data:", "")
.replace(/^.+,/, "");
setBase64Image(base64String);
};
reader.readAsDataURL(file);
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
URL.revokeObjectURL(url);
sendUploadedBankStatement();
})
.catch(() => {
setWrongPasswordError(true);
URL.revokeObjectURL(url);
});
};

const sendUploadedBankStatement = () => {
if (apiDetails) {
const apiData = {
properties: {
uploaded_documents: [
{
document_type: apiDetails.document_type,
file_path: `${localStorageValues.getSavedUserId()}/${
apiDetails && apiDetails.file_name
}.pdf`,
file: base64Image,
password: password,
},
],
},
};
const url = `${baseURL}/bank_statement/capture?v=${localStorageValues.getBuildNumber(
        "buildNumber"
      )}&latitude=12.9609079&longitude=77.6365579`;
let userOnlineStatus = navigator.onLine ? "online" : "offline";
if (userOnlineStatus === "online") {
setIsLoading(true);
axios
.post(url, apiData, tokenConfig())
.then((res) => {
setIsLoading(false);
if (res) {
if (res.status == 200) {
if (res.data) {
if (res.data.status === "OK") {
if (res.data.next === "WAITING") {
Navigator.Navigator(
"booster_waiting_screen",
props,
"replace"
);
}
}
}
}
}
})
.catch((err) => {
setIsLoading(false);
ToastMessageHandler("Failed to upload your file");
});
} else {
showToast(
"No Internet connection, Please check your internet connection and try again.",
"error"
);
clearQueue();
}
}
};

// Handler for clearing the repeated toast messages queue:
const clearQueue = () => {
setTimeout(() => {
clearWaitingQueue();
}, 3000);
};

const getBankStatementDetails = () => {
const url = `${baseURL}/bank_statement`;
setIsLoading(true);
axios
.get(url, tokenConfig())
.then((res) => {
setIsLoading(false);
if (res) {
if (res.status == 200) {
if (res.data) {
if (res.data.status == "OK") {
if (res.data.data) {
if (res.data.data.upload_document_details) {
setApiDetails(
res.data.data.upload_document_details.length >= 1 &&
res.data.data.upload_document_details[0]
);
}
}
}
}
}
}
})
.catch((err) => {
setIsLoading(false);
ToastMessageHandler("Failed to load");
});
};

useEffect(() => {
getBankStatementDetails();
}, []);

return (
<>
{isLoading ? (
<DefaultLoading />
) : (
<>
<TopHeaderEight goBack={callBack} />
<div className="pdfMainDiv">
<ToastContainerComp limit={1} />
<ToastsContainer
              position={ToastsContainerPosition.BOTTOM_CENTER}
              store={ToastsStore}
            />
<div className="pdfSubDiv">
<p className="payslipMainHeader">Upload your Bank Statement</p>
<p className="payslipSubText">Upload your 6 months bank</p>
<p className="payslipSubText" style={{ margin: "0px" }}>
statement to verify your income information.
</p>
<div className="inputsDiv">
<p className="monthHeading">{apiDetails && apiDetails.title}</p>
<label className="labelpdf">
<p>
{uploadBankStatement
? uploadBankStatement.name
: "Choose file"}
</p>
<img alt="" src={UploadImage} />
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
type={hidePassword ? "password" : "text"}
name="paySlipOne"
value={password}
required
spellCheck="false"
autoComplete="off"
onChange={onChangeHandler}
/>
<span className="customPlaceholder">Password</span>
<img
className="eyeIcon"
onClick={handleShowPassword}
src={hidePassword ? showIcon : hideIcon}
alt=""
/>
{passwordError && (
<p className="errorText">Please enter the password</p>
)}
{wrongPasswordError && (
<p className="errorText">
Please enter correct password
</p>
)}
</div>
</>
)}
</div>
</div>
</div>
<div className="btnMainDiv">
<button className="customButton" onClick={validation}>
CONTINUE
</button>
</div>
</>
)}
</>
);
};

export default ToastMessage(UploadBankStatement);
