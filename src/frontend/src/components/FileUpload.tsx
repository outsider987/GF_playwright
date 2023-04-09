// import { Dispatch, SetStateAction } from "react";
// import { Button } from "@mui/material";
// import useTranslation from "@/hooks/useTranslation";
// import { UploadFile, FileUpload as FileUploadIcon } from "@mui/icons-material";

// interface Props extends React.DOMAttributes<HTMLInputElement> {
//   files: File[];
//   setFiles: Dispatch<SetStateAction<File[]>>;
//   types?: string[];
// }

// const FileUpload = (props: Props) => {
//   const t = useTranslation();
//   const onDelete = (f_index: number) => {
//     const newArrary = props.files.filter((item, index) => index !== f_index);
//     props.setFiles(newArrary);
//   };

//   const renderInitialize = () => {
//     return (
//       <>
//         <div className="flex h-full min-h-[125px] justify-center items-center">
//           <Button variant="contained" sx={{ height: "fit-content", p: "14px 32px" }}>
//             {t.clainInformation.upload}
//             <FileUploadIcon sx={{ ml: 1 }} />
//           </Button>
//         </div>
//         <input
//           multiple
//           accept={props.types.map((item) => `.${item}`).join(",")}
//           className="absolute cursor-pointer inset-0 outline-none border-[0px] opacity-0"
//           type="file"
//           {...props}
//           onDrop={props.onChange}
//         />
//       </>
//     );
//   };
//   const renderFileList = () => {
//     return (
//       <>
//         <div className="flex flex-col  max-h-[75%] overflow-auto">
//           {props.files.map((file, index) => (
//             <div
//               key={index}
//               className="flex items-center border-0 border-b border-solid border-[#7C4A99] p-5  h-9 flex-row justify-between text-[#7C4A99] "
//             >
//               <div className="flex flex-row justify-between space-x-3 text-sm items-center">
//                 <UploadFile />
//                 <span className="text-ellipsis w-[150px] overflow-hidden">{file.name}</span>
//                 <span> {(file.size / 1024 / 1024).toFixed(2)} MB</span>
//               </div>

//               <div className="text-[#1D7E3C] cursor-pointer" onClick={() => onDelete(index)}>
//                 {t.clainInformation.delete}
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="flex justify-end p-4 text-sm">
//           <Button variant="contained" sx={{}}>
//             {t.clainInformation.uploadMore}
//             <input
//               multiple
//               accept={props.types.map((item) => `.${item}`).join(",")}
//               className="cursor-pointer absolute inset-0 outline-none border-[0px] opacity-0"
//               type="file"
//               {...props}
//               onDrop={props.onChange}
//             />
//             <FileUploadIcon sx={{ ml: 2.5, p: 0 }} />
//           </Button>
//         </div>
//       </>
//     );
//   };

//   return (
//     <div
//       className={`bg-[#F2F2F2] min-h-[125px] flex flex-col justify-between h-auto  my-5 relative rounded-xl`}
//     >
//       {props.files.length === 0 ? renderInitialize() : renderFileList()}
//     </div>
//   );
// };

// export default FileUpload;
