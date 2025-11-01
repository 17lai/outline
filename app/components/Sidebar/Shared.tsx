import { observer } from "mobx-react";
import { SidebarIcon } from "outline-icons";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { hover } from "@shared/styles";
import { metaDisplay } from "@shared/utils/keyboard";
import Share from "~/models/Share";
import Flex from "~/components/Flex";
import Scrollable from "~/components/Scrollable";
import SearchPopover from "~/components/SearchPopover";
import Tooltip from "~/components/Tooltip";
import useCurrentUser from "~/hooks/useCurrentUser";
import useStores from "~/hooks/useStores";
import history from "~/utils/history";
import { homePath, sharedModelPath } from "~/utils/routeHelpers";
import { AvatarSize } from "../Avatar";
import { useTeamContext } from "../TeamContext";
import TeamLogo from "../TeamLogo";
import Sidebar from "./Sidebar";
import Section from "./components/Section";
import { SharedCollectionLink } from "./components/SharedCollectionLink";
import { SharedDocumentLink } from "./components/SharedDocumentLink";
import SidebarButton from "./components/SidebarButton";
import ToggleButton from "./components/ToggleButton";
import { useEffect } from "react";
import { ProsemirrorHelper } from "@shared/utils/ProsemirrorHelper";

type Props = {
  share: Share;
};

function SharedSidebar({ share }: Props) {
  const team = useTeamContext();
  const user = useCurrentUser({ rejectOnEmpty: false });
  const { ui, documents, collections } = useStores();
  const { t } = useTranslation();

  const teamAvailable = !!team?.name;
  const rootNode = share.tree;
  const shareId = share.urlId || share.id;
  const collection = collections.get(rootNode?.id);
  const hideRootNode = collection
    ? ProsemirrorHelper.isEmptyData(collection?.data)
    : false;

  useEffect(() => {
    ui.tocVisible = share.showTOC;
  }, []);

  if (!rootNode?.children.length) {
    return null;
  }

  return (
    <StyledSidebar $hoverTransition={!teamAvailable} canResize={false}>
      {teamAvailable && (
        <SidebarButton
          title={team.name}
          image={
            <TeamLogo model={team} size={AvatarSize.XLarge} alt={t("Logo")} />
          }
          onClick={
            hideRootNode
              ? undefined
              : () => history.push(user ? homePath() : sharedModelPath(shareId))
          }
        />
      )}
      <ScrollContainer topShadow flex>
        <TopSection>
          <SearchWrapper>
            <StyledSearchPopover shareId={shareId} />
          </SearchWrapper>
          {!teamAvailable && (
            <ToggleWrapper>
              <ToggleSidebar />
            </ToggleWrapper>
          )}
        </TopSection>
        <Section>
          {share.collectionId ? (
            <SharedCollectionLink
              node={rootNode}
              shareId={shareId}
              hideRootNode={hideRootNode}
            />
          ) : (
            <SharedDocumentLink
              index={0}
              depth={0}
              shareId={shareId}
              node={rootNode}
              prefetchDocument={documents.prefetchDocument}
              activeDocumentId={ui.activeDocumentId}
              activeDocument={documents.active}
            />
          )}
        </Section>
      </ScrollContainer>
    </StyledSidebar>
  );
}

const ToggleSidebar = () => {
  const { t } = useTranslation();
  const { ui } = useStores();

  return (
    <Tooltip content={t("Toggle sidebar")} shortcut={`${metaDisplay}+.`}>
      <ToggleButton
        position="bottom"
        image={<SidebarIcon />}
        aria-label={
          ui.sidebarCollapsed ? t("Expand sidebar") : t("Collapse sidebar")
        }
        onClick={() => {
          ui.toggleCollapsedSidebar();
          (document.activeElement as HTMLElement)?.blur();
        }}
      />
    </Tooltip>
  );
};

const ScrollContainer = styled(Scrollable)`
  padding-bottom: 16px;
`;

const TopSection = styled(Flex)`
  padding: 8px;
  flex-shrink: 0;
`;

const SearchWrapper = styled.div`
  width: 100%;
`;

const StyledSearchPopover = styled(SearchPopover)`
  width: 100%;
  transition: width 100ms ease-out;
  margin: 8px 0;
`;

const ToggleWrapper = styled.div`
  position: absolute;
  right: 0;
  opacity: 0;
  transform: translateX(10px);
  transition:
    opacity 100ms ease-out,
    transform 100ms ease-out;
`;

const StyledSidebar = styled(Sidebar)<{ $hoverTransition: boolean }>`
  ${({ $hoverTransition }) =>
    $hoverTransition &&
    `
      @media (hover: hover) {
        &:${hover} {
        ${StyledSearchPopover} {
          width: 85%;
        }

        ${ToggleWrapper} {
          opacity: 1;
          transform: translateX(0);
          }
        }
      }
    `}
`;

export default observer(SharedSidebar);
