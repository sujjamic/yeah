"use client";

import axios, { AxiosError } from "axios";
import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useMutation } from "@tanstack/react-query";
import { toast } from "../ui/toast";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

interface DeleteCarProps {
  carId: string;
  setDeleteModal: (toggle: boolean) => void;
}

const DeleteCar: FC<DeleteCarProps> = ({ carId, setDeleteModal }) => {
  const { refresh } = useRouter();

  const { mutate, isLoading } = useMutation(
    async (id: string) => {
      const { data } = await axios.delete(`/api/cars/delete/${id}`);
      return data;
    },
    {
      onSuccess: (successData: any) => {
        console.log(successData);
        setDeleteModal(false);

        toast({
          title: "success deleting repair",
          message: "okay",
          type: "success",
        });
        refresh();
      },
      onError: (error: any) => {
        if (error instanceof AxiosError) {
          toast({
            title: "Error deleting repair",
            message: `${error?.response?.data.error} ⚠️`,
            type: "error",
          });
        }
        console.log(error);
      },
    }
  );

  console.log("carId:", carId);

  const deleteRepair = () => {
    mutate(carId);
  };

  return (
    <div className="fixed bg-black/50 w-full h-full z-20 left-0 top-0 ">
      <div className="absolute bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-12 rounded-lg flex flex-col gap-6">
        <div className="flex">
          <div
            className="p-1 border border-red-500 rounded-md"
            onClick={() => {
              setDeleteModal(false);
            }}
          >
            <AiOutlineClose className="text-2xl  text-red-500 font-black cursor-pointer" />
          </div>
        </div>
        <h2 className="text-xl">
          Are you sure you want to delete this car details?
        </h2>
        <p className="text-red-600 text-sm">
          deleting this car data also deletes all repairs and other data
          attached to it!
        </p>

        <Button
          onClick={deleteRepair}
          variant="purple"
          className="items-center"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Delete Car
        </Button>
      </div>
    </div>
  );
};

export default DeleteCar;
