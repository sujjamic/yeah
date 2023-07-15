"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { add, format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "../ui/toast";
import Loading from "../ui/Loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { buttonVariants } from "../ui/Button";

interface SelectDateTimeProps {
  session: DateTime;
  setSession: Dispatch<SetStateAction<DateTime>>;
  setDayId: Dispatch<SetStateAction<string | undefined>>;
  setToggle: Dispatch<SetStateAction<boolean>>;
}

interface DateTime {
  justDate: Date | null;
  dateTime: Date | null;
}

const SelectDateTime: FC<SelectDateTimeProps> = ({
  session,
  setSession,
  setDayId,
  setToggle,
}) => {
  const [select, setSelect] = useState(-1);

  const getTimes = () => {
    if (!session.justDate) return;

    const { justDate } = session;

    const beginning = add(justDate, { hours: 9 });
    const end = add(justDate, { hours: 17 });
    const interval = 30; //in minutes

    const times = [];

    for (let i = beginning; i < end; i = add(i, { minutes: interval })) {
      times.push(i);
    }

    return times;
  };

  const times = getTimes();

  // console.log('date:',session.justDate)
  // console.log(session.dateTime?.getTime());

  const sessionData = async (info: any) => {
    const { data } = await axios.post(`/api/booking/${info}`);
    return data?.selected;
  };

  const { mutate, error, isLoading, isError, data } = useMutation(sessionData, {
    onSuccess: (successData) => {
      console.log(successData);

      toast({
        title: "success creating new car",
        message: "okay",
        type: "success",
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast({
          title: "Error creating new customer",
          message: `${error?.response?.data.error} ⚠️`,
          type: "error",
        });
      }
    },
  });

  let allSelectedSessions: Map<any, any> = new Map();

  if (data) {
    setDayId(data.id);
    const s = data.selectedSesions;
    for (let i = 0; i < s.length; i++) {
      let selected = s[i].time;
      allSelectedSessions.set(
        selected,
        (allSelectedSessions.get(selected) || 0) + 1
      );
    }
  }

  if (isLoading) {
    return <Loading text="loading sessions for selected date" />;
  }

  if (isError) {
    return <p className="text-red-500 font-bold">Error loading data!</p>;
  }
  //  console.log(allSelectedSessions)
  return (
    <div>
      <h4 className="font-medium text-sm mt-8">
        Please Select a date to see all available sessions
      </h4>
      <DatePicker
        selected={session.justDate}
        dateFormat="dd-MM-yy"
        minDate={new Date()}
        className={`${buttonVariants({
          variant: "purple",
        })} text-lg text-white mt-4`}
        placeholderText="select date"
        filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
        onChange={(date: Date) => {
          setSession((prevDetails) => ({ ...prevDetails, justDate: date }));
          console.log(typeof date.getTime());
          console.log(date.getTime());
          mutate(date.getTime());
        }}
      />

      {data?.open === true && (
        <>
          <h4 className="font-medium text-sm mt-8">All sessions for selected date</h4>
          <div className="grid grid-cols-tile gap-6 mt-4">
            {times?.map((time, i) =>
              allSelectedSessions.has(`${time.getTime()}`) ? (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-red-200 border cursor-not-allowed rounded-lg py-2 text-center ">
                        {format(time, "kk:mm")}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>unavailable</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  key={i}
                  onClick={() => {
                    setSelect(i);
                    setSession((prevDetails) => ({
                      ...prevDetails,
                      dateTime: time,
                    }));
                    setToggle(true);
                  }}
                  className={`${
                    select == i ? "bg-green-400" : "bg-zinc-200"
                  }  border cursor-pointer rounded-lg py-2 text-center`}
                >
                  {format(time, "kk:mm")}
                </div>
              )
            )}
          </div>
        </>
      )}

      {data?.open === false && (
        <h3 className="text-red-500">No Available sessions for this date!!</h3>
      )}
    </div>
  );
};

export default SelectDateTime;
