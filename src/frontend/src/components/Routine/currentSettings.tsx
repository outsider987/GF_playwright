import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Button from '../Button';
import { useRoutineAPI } from '~/ipcRenderAPI/routine';
import { useRoutineContext } from '~/store/context/hooks/routine/useRoutineStateHook';
import NamingModal from '../modals/NamingModal';

interface Props extends React.ButtonHTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  rounded?: boolean;
  white?: boolean;
}

const CurrentSettings: React.FC<Props> = (props) => {
  const [settingNaming, setSettingNaming] = React.useState('');
  const { INVOKE_GET_ROUTINE_STATE, INVOKE_SAVE_ROUTINE_STATE, INVOKE_DELETE_SETTING } = useRoutineAPI();
  const [settings, setSettingValue] = useState([]);
  const { routineState, setRoutineState } = useRoutineContext();

  useEffect(() => {
    INVOKE_GET_ROUTINE_STATE().then((res) => {
      if (res) setSettingValue(res);
    });
  }, []);

  const onclickSetting = async (index) => {
    const deepCopy = JSON.parse(JSON.stringify(settings[index]));
    delete deepCopy.name;
    setRoutineState({ ...routineState, ...deepCopy });
    // await INVOKE_GET_ROUTINE_STATE().then((res) => {
    //   setSettingValue(res);
    // });
  };
  const [isNameingModalOpen, setIsNameingModalOpen] = React.useState(false);
  const handleSaveSettings = async (e) => {
    setIsNameingModalOpen(false);
    await INVOKE_SAVE_ROUTINE_STATE(routineState, settingNaming);
    const res = await INVOKE_GET_ROUTINE_STATE();
    if (res) setSettingValue(res);
  };
  const handleDeleteSettings = async (index) => {
    await INVOKE_DELETE_SETTING(index);
    await INVOKE_GET_ROUTINE_STATE().then((res) => {
      setSettingValue(res);
    });
  };

  return (
    <div className="flex flex-row">
      <div className="flex space-x-3 mr-2">
        {settings.map((setting, index) => {
          return (
            <div key={index} className="text-center bg-orange-600 flex justify-center items-center">
              <div className="relative">
                <div onClick={() => handleDeleteSettings(index)}>
                  <CloseIcon className=" absolute right-0 top-0 "></CloseIcon>
                </div>

                <span className=" cursor-pointer" onClick={() => onclickSetting(index)}>
                  {index + 1}.{setting.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={() => setIsNameingModalOpen(true)} {...props} className="w-[10vw] ">
        儲存
      </Button>

      <Button className="w-[10vw]">重置</Button>
      <NamingModal
        value={settingNaming}
        setvalue={setSettingNaming}
        titile={'確認要啟動?'}
        backdrop={() => setIsNameingModalOpen(false)}
        toggle={isNameingModalOpen}
        onConfirm={handleSaveSettings}
      ></NamingModal>
    </div>
  );
};
CurrentSettings.defaultProps = { rounded: false, white: true };
export default CurrentSettings;
