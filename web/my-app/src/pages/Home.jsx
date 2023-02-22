import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField } from "@mui/material";
import { validURL } from "components/function/common";
import CircularProgress from "@mui/material/CircularProgress";
import {
  connectToGoogle,
  getAllLinkFromPage,
  getGoogleStatus,
  postOneLinkToBlogspot,
} from "service/BlogspotService";
import formatRFC3339 from "date-fns/formatRFC3339";
import addHours from "date-fns/addHours";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";

const runTypeData = [
  {
    id: 0,
    value: "Just One Link",
  },
  {
    id: 1,
    value: "List Link",
  },
];

const intervalBetweenPostData = [
  {
    id: 0,
    value: "45 minutes",
    time: 0.75,
  },
  {
    id: 1,
    value: "1 hours",
    time: 1,
  },
  {
    id: 2,
    value: "2 hours",
    time: 2,
  },
  {
    id: 3,
    value: "3 hours",
    time: 3,
  },
  {
    id: 4,
    value: "4 hours",
    time: 4,
  },
  {
    id: 5,
    value: "5 hours",
    time: 5,
  },
  {
    id: 6,
    value: "6 hours",
    time: 6,
  },
  {
    id: 7,
    value: "7 hours",
    time: 7,
  },
  {
    id: 8,
    value: "8 hours",
    time: 8,
  },
  {
    id: 9,
    value: "9 hours",
    time: 9,
  },
  {
    id: 10,
    value: "10 hours",
    time: 10,
  },
  {
    id: 11,
    value: "11 hours",
    time: 11,
  },
  {
    id: 12,
    value: "12 hours",
    time: 12,
  },
];

const listLinkTypeData = [
  {
    id: 0,
    value: "posh all link in page",
  },
  {
    id: 1,
    value: "post list selection link",
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
const postType = [
  {
    id: 0,
    value: "Post Now",
  },
  {
    id: 1,
    value: "Post Later",
  },
];

const domainData = [
  {
    id: 0,
    value: "https://thebestcatpage.com/",
  },
];

const Home = () => {
  // function values
  const [googleStatus, setGoogleStatus] = React.useState(false);
  const [runType, setRuntype] = React.useState(runTypeData[0]);
  const [intervalBetweenPostTime, setIntervalBetweenPostTime] = React.useState(
    intervalBetweenPostData[1]
  );
  const [listLinkType, setListLinkType] = React.useState(listLinkTypeData[0]);
  const [imageType, setImageType] = React.useState(imageTypeData[0]);
  const [chatGPTType, setChatGPTType] = React.useState(chatGPTTypeData[0]);
  const [domain, setDomain] = React.useState(domainData[0]);
  const [linkDemo, setLinkDemo] = React.useState("");
  const [linkPage, setLinkPage] = React.useState("");
  const [selectedInput, setSelectedInput] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [linkDemoIsValid, setLinkDemoIsValid] = React.useState(true);
  const [linkPageIsValid, setLinkPageIsValid] = React.useState(true);
  const [isButtonOk, setIsButtonOK] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState({
    all: false,
    onProcess: false,
  });
  const [postNow, setPostNow] = React.useState(postType[0]);
  const [timePost, setTimePost] = React.useState(new Date());
  const [postDataStatus, setPostDataStatus] = React.useState({
    show: false,
    isOk: true,
    message: "",
  });
  const [allLinkStatus, setAllLinkStatus] = React.useState({
    show: false,
    isOk: true,
    message: "",
    data: null,
  });
  const [dataShow, setDataShow] = React.useState([]);
  const [listLinkOKShow, setListLinkOKShow] = React.useState([]);
  const [listLinkFalseShow, setListLinkFalseShow] = React.useState([]);
  const [dataItem, setDataItem] = React.useState(<></>);

  const updateRunType = (event, type) => {
    if (type == 0) {
      setAllLinkStatus({
        show: false,
        isOk: true,
        message: "",
        data: null,
      });
    }
    setRuntype(runTypeData[type]);
  };

  const updateIntervalBetweenPostTime = (event, type) => {
    setIntervalBetweenPostTime(intervalBetweenPostData[event.target.value]);
  };

  const updateListLinkType = (event, type) => {
    setListLinkType(listLinkTypeData[type]);
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

  const updatePostType = (event) => {
    setPostNow(postType[event.target.value]);
    setTimePost(new Date());
  };

  const handleChange = (newValue) => {
    setTimePost(new Date(newValue));
  };

  useEffect(() => {
    getGoogleStatus().then((statusData) => {
      // console.log(statusData);
      setGoogleStatus(statusData);
    });
  }, []);

  useEffect(() => {
    if (linkDemo !== "") {
      setLinkDemoIsValid(validURL(linkDemo) && linkDemo.includes(domain.value));
    }
  }, [domain.value, googleStatus, linkDemo]);

  useEffect(() => {
    if (linkPage !== "") {
      setLinkPageIsValid(validURL(linkPage) && linkPage.includes(domain.value));
    }
  }, [domain.value, googleStatus, linkPage]);

  useEffect(() => {
    const isOk = linkDemo !== "" && linkDemoIsValid;
    setIsButtonOK(isOk);
  }, [linkDemo, linkDemoIsValid]);

  useEffect(() => {
    if (postDataStatus.message !== "") {
      var temp = dataShow;
      temp.push({
        isOk: postDataStatus.isOk,
        message: postDataStatus.message,
      });
      setDataShow(temp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postDataStatus]);

  useEffect(() => {
    setDataItem(
      <>
        {dataShow.map((item, index) => {
          return (
            <div className="flex items-center" key={index}>
              {item.isOk ? (
                <DoneIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}

              <p
                className={`flex ml-5 ${
                  item.isOk ? "text-[blue]" : "text-red-500"
                }  whitespace-pre-wrap`}
              >
                {item.message}
              </p>
            </div>
          );
        })}
      </>
    );
  }, [dataShow, postDataStatus]);

  return (
    <div className="flex flex-col w-full items-center">
      {loading && (
        <div className="fixed right-0 bottom-0 top-0 left-0 h-[100%] w-[100%] flex justify-center items-center bg-[#00000050] z-10">
          <CircularProgress size={60} />
        </div>
      )}
      {postDataStatus.show && (
        <div className="fixed right-0 bottom-0 top-0 left-0 h-[100%] w-[100%] flex justify-center items-center bg-[#00000050] z-10">
          <div
            className={`flex flex-col items-center justify-center p-5 rounded-[24px] border-[1px] border-blue-700  border-solid bg-[#fff] w-[800px]`}
          >
            <div className="font-bold text-black text-[40px] mt-10">
              Post Result
            </div>
            <hr className="h-[2px] my-10 bg-[#000] w-full mx-10"></hr>
            <div className={`flex flex-col whitespace-pre-wrap mb-10`}>
              {dataItem}
            </div>
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={() => {
                setPostDataStatus({
                  show: false,
                  isOk: true,
                  message: "",
                });
                setDataShow([]);
                setLinkDemo("");
                setAllLinkStatus({
                  show: false,
                  isOk: true,
                  message: "",
                  data: null,
                });
              }}
              className={"h-[50px]"}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      {loadingList.all && (
        <div className="fixed right-0 bottom-0 top-0 left-0 h-[100%] w-[100%] flex justify-center items-center bg-[#00000050] z-10">
          <div
            className={`flex flex-col items-center justify-center p-5 rounded-[24px] border-[1px] border-blue-700  border-solid bg-[#fff] w-[800px]`}
          >
            {loadingList.onProcess && (
              <div className="flex w-full h-[100px] items-center justify-center">
                <CircularProgress size={60} />
              </div>
            )}
            <div className="font-bold text-black text-[40px] mt-10">
              Post Result
            </div>
            <hr className="h-[2px] my-10 bg-[#000] w-full mx-10"></hr>
            <div className={`flex flex-col whitespace-pre-wrap mb-10`}>
              {dataItem}
            </div>
            <Button
              variant="contained"
              disabled={loadingList.onProcess}
              startIcon={<CancelIcon />}
              onClick={() => {
                setLoadingList({
                  all: false,
                  onProcess: false,
                });
                setDataShow([]);
                setLinkPage("");
                setAllLinkStatus({
                  show: false,
                  isOk: true,
                  message: "",
                  data: null,
                });
              }}
              className={"h-[50px]"}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      <div className="flex">
        <div className="p-10 flex flex-col text-black">
          <div className={"flex items-start flex-col"}>
            <div className="flex w-full items-center justify-center">
              <div className="flex items-center mr-10">
                <Button
                  variant="contained"
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    setLoading(true);
                    connectToGoogle().then((ok) => {
                      getGoogleStatus().then((statusData) => {
                        setGoogleStatus(statusData);
                        setLoading(false);
                      });
                    });
                  }}
                  disabled={googleStatus}
                  className={"h-[50px]"}
                >
                  Connect to Google
                </Button>
              </div>
              {googleStatus ? (
                <div className="bg-blue-500 flex items-center justify-center w-[400px] h-[100px] rounded-[20px]">
                  <p className="text-[#FFF]">You are connected to google</p>
                </div>
              ) : (
                <div className="bg-red-500 flex items-center justify-center w-[400px] h-[100px] rounded-[20px]">
                  <p className="text-[#FFF]">You are not connected to google</p>
                </div>
              )}
            </div>

            <div className="flex flex-row justify-center">
              <div className="p-10 rounded-[24px] border-[1px] border-black  border-solid mt-10 max-w-[600px]">
                <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-5">
                  <div className="mb-1 mt-2 flex">
                    Image Type :{" "}
                    <p className="font-bold ml-2 text-red-500">
                      {" "}
                      {imageType.value}
                    </p>
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
                    <p className="font-bold ml-2 text-red-500">
                      {" "}
                      {chatGPTType.value}
                    </p>
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
                <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-10">
                  <div className="my-1 flex">
                    Run Type :{" "}
                    <p className="font-bold ml-2"> {runType.value}</p>
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
                </div>
              </div>
              <div className="p-10 ml-10 rounded-[24px] border-[1px] border-black  border-solid mt-10 max-w-[800px]">
                <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-5">
                  <div className="mb-1 mt-2 flex">
                    <p>Time Now :</p>
                    <p className="font-bold ml-2"> {formatRFC3339(timePost)}</p>
                  </div>
                  <RadioGroup
                    name="value"
                    row
                    value={postNow.id}
                    onChange={updatePostType}
                  >
                    {postType.map((datum) => (
                      <FormControlLabel
                        label={datum.value}
                        key={datum.value}
                        value={datum.id}
                        control={<Radio color="primary" />}
                      />
                    ))}
                  </RadioGroup>
                  {postNow.id === 0 ? (
                    <p className="font-normal">
                      {"We post an article immediately"}
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      <DateTimePicker
                        label="Date&Time Post"
                        value={timePost}
                        onChange={handleChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            inputProps={{
                              ...params.inputProps,
                              readOnly: true,
                            }}
                          />
                        )}
                      />
                    </div>
                  )}

                  {runType.id === 1 && (
                    <>
                      <div className="flex mt-5">
                        <p className="">The interval between posts is </p>
                        <p className="font-bold text-red-500 ml-2">
                          {intervalBetweenPostTime.value}
                        </p>
                      </div>
                      <Select
                        className="mt-2 px-2 w-[500px]"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select-1"
                        value={intervalBetweenPostTime.id}
                        label={intervalBetweenPostTime.value}
                        onChange={updateIntervalBetweenPostTime}
                      >
                        {intervalBetweenPostData.map((data) => {
                          return (
                            <MenuItem key={data.value} value={data.id}>
                              {data.value}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </>
                  )}
                </div>
                <div className="mt-8">
                  <TextField
                    id="demo-link-2222"
                    label="Tags in Blogger"
                    variant="outlined"
                    className=" w-[300px]"
                    onChange={(e) => {
                      setTag(e.target.value);
                    }}
                  />
                </div>
                {runType.id === 1 && (
                  <div className="p-5 rounded-[24px] border-[1px] border-blue-700  border-solid mt-10">
                    <div className="my-1 flex">
                      List Link Type :
                      <p className="font-bold ml-2"> {listLinkType.value}</p>
                    </div>
                    <RadioGroup
                      name="value"
                      row
                      value={listLinkType.id}
                      onChange={updateListLinkType}
                      className={"mb-5"}
                    >
                      {listLinkTypeData.map((datum) => (
                        <FormControlLabel
                          label={datum.value}
                          key={datum.value}
                          value={datum.id}
                          control={<Radio color="primary" />}
                        />
                      ))}
                    </RadioGroup>

                    {listLinkType.id === 0 && (
                      <>
                        {!linkPageIsValid && (
                          <p className="mb-4 font-bold text-red-700">
                            Please input link correct
                          </p>
                        )}
                        <TextField
                          id="demo-link"
                          label="Link page"
                          variant="outlined"
                          className=" w-[400px] mt-5"
                          onChange={(e) => {
                            setLinkPage(e.target.value);
                          }}
                          error={!linkPageIsValid}
                        />
                        <div className="mt-5">
                          <Button
                            variant="contained"
                            disabled={linkPage === "" || !linkPageIsValid}
                            onClick={async () => {
                              setLoading(true);
                              getAllLinkFromPage({
                                link: linkPage,
                                domainID: domain.id,
                              }).then((e) => {
                                console.log(e);
                                setLoading(false);
                                setAllLinkStatus({
                                  show: true,
                                  isOk: e.isOk,
                                  message: e.message,
                                  data: e.data,
                                });
                              });
                            }}
                          >
                            {"Get All Links in page"}
                          </Button>
                        </div>

                        <div
                          className={`flex flex-col whitespace-pre-wrap mb-10`}
                        >
                          {allLinkStatus.show && (
                            <div className="flex flex-col rounded-[24px] border-[1px] border-orange-700  border-solid mt-10 p-5 max-w-[600px]">
                              <>
                                <p className="font-bold text-[30px]">
                                  List Link Detected:
                                </p>
                                {allLinkStatus.data.map((item, index) => {
                                  return (
                                    <p
                                      className="flex mt-5 whitespace-pre-wrap text-blue-500"
                                      key={index}
                                    >
                                      {item}
                                    </p>
                                  );
                                })}
                              </>
                              <div className="mt-5">
                                <Button
                                  variant="contained"
                                  disabled={loadingList.all || !googleStatus}
                                  onClick={async () => {
                                    setLoadingList({
                                      all: true,
                                      onProcess: true,
                                    });

                                    const baseTime =
                                      postNow.id === 0 ? new Date() : timePost;
                                    var timeToPost = baseTime;
                                    for (const link of allLinkStatus.data) {
                                      await postOneLinkToBlogspot({
                                        runTest:
                                          runType.id === 0 ? true : false,
                                        uploadImage:
                                          imageType.id === 0 ? false : true,
                                        usingGPT:
                                          chatGPTType.id === 0 ? false : true,
                                        domain: domain.id,
                                        linkDemo: link,
                                        tag: tag,
                                        timePost: formatRFC3339(timeToPost),
                                        domainID: domain.id,
                                        // eslint-disable-next-line no-loop-func
                                      }).then((e) => {
                                        var msg = `${
                                          e.message
                                        } in Time : ${formatRFC3339(
                                          timeToPost
                                        )}`;
                                        setDataShow((oldArray) => [
                                          ...oldArray,
                                          {
                                            id: link,
                                            isOk: e.isOk,
                                            message: msg,
                                          },
                                        ]);
                                      });
                                      timeToPost = addHours(timeToPost, intervalBetweenPostTime.time);
                                      await new Promise((r) => {
                                        setTimeout(r, 1 * 1000);
                                      });
                                    }
                                    setLoadingList({
                                      all: true,
                                      onProcess: false,
                                    });
                                  }}
                                >
                                  {"Post All"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {listLinkType.id === 1 && (
                      <>
                        <TextField
                          id="demo-link-selected"
                          label="List selection link"
                          placeholder="Example : link 1, link 2, link 3, ..."
                          variant="outlined"
                          className=" w-[500px] mt-5"
                          multiline
                          rows={10}
                          onChange={(e) => {
                            setSelectedInput(e.target.value);
                          }}
                        />
                        <div className="mt-10">
                          <Button
                            variant="contained"
                            disabled={selectedInput === ""}
                            onClick={async () => {
                              const listLinkSelectedArrayInput = selectedInput
                                .replace(/\s/g, "")
                                .split(",");
                              var listLinkOK = [];
                              var listLinkFalse = [];
                              for (const link of listLinkSelectedArrayInput) {
                                if (
                                  validURL(link) &&
                                  link.includes(domain.value)
                                ) {
                                  listLinkOK.push(link);
                                } else {
                                  listLinkFalse.push(link);
                                }
                              }
                              setListLinkOKShow(listLinkOK);
                              setListLinkFalseShow(listLinkFalse);
                            }}
                          >
                            {"Verify list Link"}
                          </Button>
                        </div>
                        {listLinkFalseShow.length > 0 && (
                          <div className="flex flex-col items-center justify-end p-5 rounded-[24px] border-[1px] border-orange-700  border-solid mt-5">
                            <p className="font-bold text-red-500">
                              Invalid link list
                            </p>
                            <hr className="h-[2px] my-2 bg-[#000] w-full mx-10"></hr>
                            <div>
                              {listLinkFalseShow.map((item) => {
                                return <p>{item}</p>;
                              })}
                            </div>
                          </div>
                        )}
                        {listLinkOKShow.length > 0 && (
                          <div className="flex flex-col items-center justify-end p-5 rounded-[24px] border-[1px] border-orange-700  border-solid mt-5">
                            <p className="font-bold text-blue-500">
                              Valid link list
                            </p>
                            <hr className="h-[2px] my-2 bg-[#000] w-full mx-10"></hr>
                            <div>
                              {listLinkOKShow.map((item) => {
                                return <p>{item}</p>;
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col mt-10">
                          <p className="font-bold text-blue-500">
                            We only process valid links
                          </p>
                          <div className="mt-5">
                            <Button
                              variant="contained"
                              disabled={
                                loadingList.all ||
                                !googleStatus ||
                                listLinkOKShow.length === 0
                              }
                              onClick={async () => {
                                setLoadingList({
                                  all: true,
                                  onProcess: true,
                                });

                                const baseTime =
                                  postNow.id === 0 ? new Date() : timePost;
                                var timeToPost = baseTime;
                                for (const link of listLinkOKShow) {
                                  await postOneLinkToBlogspot({
                                    runTest: runType.id === 0 ? true : false,
                                    uploadImage:
                                      imageType.id === 0 ? false : true,
                                    usingGPT:
                                      chatGPTType.id === 0 ? false : true,
                                    domain: domain.id,
                                    linkDemo: link,
                                    tag: tag,
                                    timePost: formatRFC3339(timeToPost),
                                    domainID: domain.id,
                                    // eslint-disable-next-line no-loop-func
                                  }).then((e) => {
                                    var msg = `${
                                      e.message
                                    } in Time : ${formatRFC3339(timeToPost)}`;
                                    setDataShow((oldArray) => [
                                      ...oldArray,
                                      {
                                        id: link,
                                        isOk: e.isOk,
                                        message: msg,
                                      },
                                    ]);
                                  });
                                  timeToPost = addHours(timeToPost, 4);
                                  await new Promise((r) => {
                                    setTimeout(r, 1 * 1000);
                                  });
                                }
                                setLoadingList({
                                  all: true,
                                  onProcess: false,
                                });
                              }}
                            >
                              {"Post Selected Link"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {runType.id === 0 && (
                  <>
                    <div className="mt-8">
                      {!linkDemoIsValid && (
                        <p className="mb-4 font-bold text-red-700">
                          Please input link correct
                        </p>
                      )}
                      <TextField
                        id="demo-link"
                        label="Link 1 post"
                        variant="outlined"
                        className=" w-[400px]"
                        onChange={(e) => {
                          setLinkDemo(e.target.value);
                        }}
                        error={!linkDemoIsValid}
                      />
                    </div>
                    <div className="mt-10">
                      <Button
                        variant="contained"
                        disabled={!isButtonOk || !googleStatus}
                        onClick={async () => {
                          setLoading(true);
                          postOneLinkToBlogspot({
                            runTest: runType.id === 0 ? true : false,
                            uploadImage: imageType.id === 0 ? false : true,
                            usingGPT: chatGPTType.id === 0 ? false : true,
                            domain: domain.id,
                            linkDemo: linkDemo,
                            tag: tag,
                            timePost:
                              postNow.id === 0
                                ? formatRFC3339(new Date())
                                : formatRFC3339(timePost),
                            domainID: domain.id,
                          }).then((e) => {
                            console.log(e);
                            setLoading(false);
                            setPostDataStatus({
                              show: true,
                              isOk: e.isOk,
                              message: e.message,
                            });
                          });
                        }}
                      >
                        {"Crawl and post singer Link to Blogger"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
