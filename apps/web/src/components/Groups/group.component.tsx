import { Group } from "@repo/types";
import { Cell } from "@telegram-apps/telegram-ui";


type GroupComponentProps = {
      group: Group
}

export function GroupComponent({ group }: GroupComponentProps) {
      return (
            <Cell>
                  {group.name}
            </Cell>
      );
}
