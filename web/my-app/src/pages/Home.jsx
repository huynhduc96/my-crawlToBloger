import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";
import { validURL } from "components/function/common";
import { createUser, getAllUsers } from "service/UserService";
import { postToBlogspot } from "service/BlogspotService";

const runTypeData = [
  {
    id: 0,
    value: "Test",
  },
  {
    id: 1,
    value: "Production",
  },
];

const chatGPTTypeData = [
  {
    id: 0,
    value: "Not Use",
  },
  {
    id: 1,
    value: "Using",
  },
];

const imageTypeData = [
  {
    id: 0,
    value: "Using image from source",
  },
  {
    id: 1,
    value: "Upload image to drive",
  },
];

const domainData = [
  {
    id: 0,
    value: "https://thebestcatpage.com/",
  },
];

// const userCreate = (e) => {
//   createUser(user).then((response) => {
//     console.log(response);
//   });
// };

const fetchAllUsers = () => {
  getAllUsers().then((users) => {
    console.log(users);
  });
};

const postToBlogger = (e) => {
  postToBlogspot(e).then((users) => {
    console.log(users);
  });
};

const Home = () => {
  // function values

  const [runType, setRuntype] = React.useState(runTypeData[0]);
  const [imageType, setImageType] = React.useState(imageTypeData[0]);
  const [chatGPTType, setChatGPTType] = React.useState(chatGPTTypeData[0]);
  const [domain, setDomain] = React.useState(domainData[0]);
  const [linkDemo, setLinkDemo] = React.useState("");
  const [linkDemoIsValid, setLinkDemoIsValid] = React.useState(true);
  const [isButtonOk, setIsButtonOK] = React.useState(false);

  const updateRunType = (event, type) => {
    setRuntype(runTypeData[type]);
  };

  const updateImageType = (event, type) => {
    setImageType(imageTypeData[type]);
  };

  const updateChatGPTType = (event, type) => {
    setChatGPTType(chatGPTTypeData[type]);
  };

  const updateDomain = (event) => {
    setDomain(domainData[event.target.value]);
  };

  useEffect(() => {
    if (linkDemo !== "") {
      setLinkDemoIsValid(validURL(linkDemo) && linkDemo.includes(domain.value));
    }
  }, [domain.value, linkDemo]);

  useEffect(() => {
    const isOk = linkDemo !== "" && linkDemoIsValid;
    setIsButtonOK(isOk);
  }, [linkDemo, linkDemoIsValid]);

  return (
    <div className="p-10 flex flex-col text-black">
      <div className={"flex items-start flex-col"}>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => {}}>
          Back to Home
        </Button>

        <p className="font-bold mt-10">Domain Execute</p>
        <Select
          className="mt-2 px-2 w-[500px]"
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={domain.id}
          label={domain.value}
          onChange={updateDomain}
        >
          {domainData.map((data) => {
            return (
              <MenuItem key={data.value} value={data.id}>
                {data.value}
              </MenuItem>
            );
          })}
        </Select>

        <div className="p-10 rounded-[24px] border-[1px] border-black  border-solid mt-10">
          <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid">
            <div className="my-1 flex">
              Run Type : <p className="font-bold ml-2"> {runType.value}</p>
            </div>
            <RadioGroup
              name="value"
              row
              value={runType.id}
              onChange={updateRunType}
            >
              {runTypeData.map((datum) => (
                <FormControlLabel
                  label={datum.value}
                  key={datum.value}
                  value={datum.id}
                  control={<Radio color="primary" />}
                />
              ))}
            </RadioGroup>

            <p className="font-normal">
              {"In test mode, the system will upload an article immediately"}
            </p>
          </div>
          <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-5">
            <div className="mb-1 mt-2 flex">
              Image Type : <p className="font-bold ml-2"> {imageType.value}</p>
            </div>
            <RadioGroup
              name="value"
              row
              value={imageType.id}
              onChange={updateImageType}
            >
              {imageTypeData.map((datum) => (
                <FormControlLabel
                  label={datum.value}
                  key={datum.value}
                  value={datum.id}
                  control={<Radio color="primary" />}
                />
              ))}
            </RadioGroup>
            <p className="font-normal">
              {
                "In Using image from source mode, the system will using image link from origin source"
              }
            </p>
          </div>
          <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-5">
            <div className="mb-1 mt-2 flex">
              Using ChatGPT to rewite title :
              <p className="font-bold ml-2"> {chatGPTType.value}</p>
            </div>
            <RadioGroup
              name="value"
              row
              value={chatGPTType.id}
              onChange={updateChatGPTType}
            >
              {chatGPTTypeData.map((datum) => (
                <FormControlLabel
                  label={datum.value}
                  key={datum.value}
                  value={datum.id}
                  control={<Radio color="primary" />}
                />
              ))}
            </RadioGroup>
            <p className="font-normal">
              {"We can Using ChatGPT to rewrite title"}
            </p>
          </div>
          <div className="mt-8">
            {!linkDemoIsValid && (
              <p className="mb-4 font-bold text-red-700">
                Please input link correct
              </p>
            )}
            <TextField
              id="demo-link"
              label="Link Demo"
              variant="outlined"
              className=" w-[700px]"
              onChange={(e) => {
                setLinkDemo(e.target.value);
              }}
              error={!linkDemoIsValid}
            />
          </div>

          <div className="mt-10">
            <Button
              variant="contained"
              disabled={!isButtonOk}
              startIcon={<HomeIcon />}
              onClick={async () => {
                postToBlogger({
                  runType: runType.id,
                  imageType: imageType.id,
                  chatGPTType: chatGPTType.id,
                  domain: domain.id,
                  linkDemo: linkDemo,
                });
              }}
            >
              {"Upload Image"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
