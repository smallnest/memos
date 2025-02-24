import { useEffect, useState } from "react";
import { memoServiceClient } from "@/grpcweb";
import { useTagStore } from "@/store/module";
import { useMemoStore } from "@/store/v1";
import { useTranslate } from "@/utils/i18n";
import { User } from "@/types/proto/api/v2/user_service";
import Icon from "./Icon";

interface Props {
  user: User;
}

const PersonalStatistics = (props: Props) => {
  const t = useTranslate();
  const { user } = props;
  const tagStore = useTagStore();
  const memoStore = useMemoStore();
  const [memoAmount, setMemoAmount] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const days = Math.ceil((Date.now() - user.createTime!.getTime()) / 86400000);
  const memos = Object.values(memoStore.getState().memoMapById);
  const tags = tagStore.state.tags.length;

  useEffect(() => {
    if (memos.length === 0) {
      return;
    }

    (async () => {
      setIsRequesting(true);
      const { stats } = await memoServiceClient.getUserMemosStats({
        name: user.name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setIsRequesting(false);
      setMemoAmount(Object.values(stats).reduce((acc, cur) => acc + cur, 0));
    })();
  }, [memos.length, user.name]);

  return (
    <div className="w-full border mt-2 py-2 px-3 rounded-md space-y-0.5 text-gray-500 dark:text-gray-400 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
      <p className="text-sm font-medium">{t("statistics.Statistics")}</p>
      <div className="w-full flex justify-between items-center">
        <div className="w-full flex justify-start items-center">
          <Icon.CalendarDays className="w-4 h-auto mr-1" />
          <span className="block text-base sm:text-sm">{t("statistics.Days")}</span>
        </div>
        <span className="font-mono">{days}</span>
      </div>
      <div className="w-full flex justify-between items-center">
        <div className="w-full flex justify-start items-center">
          <Icon.Library className="w-4 h-auto mr-1" />
          <span className="block text-base sm:text-sm">{t("statistics.Memos")}</span>
        </div>
        {isRequesting ? <Icon.Loader className="animate-spin w-4 h-auto text-gray-400" /> : <span className="font-mono">{memoAmount}</span>}
      </div>
      <div className="w-full flex justify-between items-center">
        <div className="w-full flex justify-start items-center">
          <Icon.Hash className="w-4 h-auto mr-1" />
          <span className="block text-base sm:text-sm">{t("statistics.Tags")}</span>
        </div>
        <span className="font-mono">{tags}</span>
      </div>
    </div>
  );
};

export default PersonalStatistics;
