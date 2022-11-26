import { useState } from 'react';
import {
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiHeader,
  EuiIcon,
  EuiPinnableListGroup,
  EuiPinnableListGroupItemProps,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiListGroup,
  useGeneratedHtmlId,
  EuiAvatar,
  EuiThemeProvider,
  EuiBetaBadge,
  EuiSelect,
} from '@elastic/eui';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { css } from '@emotion/react';
import ThemeSwitcher from '../components/chrome/theme_switcher';
import { ClusterSelector } from '../components/k8s/cluster-selector';

const TopLinks: EuiPinnableListGroupItemProps[] = [
  {
    label: 'Home',
    iconType: 'home',
    isActive: true,
    'aria-current': true,
    href: `/kibana`,
    pinnable: false,
  },
];

const KibanaLinks: EuiPinnableListGroupItemProps[] = [
  { label: 'Cluster Health', href: `/dashboards/cluster-health` },
  { label: 'Pod Health', href: `/dashboards/pods` },
];

const SecurityLinks: EuiPinnableListGroupItemProps[] = [
  { label: 'Pods', href: `/dashboards/pods` },
];

const CollapsibleNav = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);

  const breadcrumbs = [
    {
      text: 'Home',
    },
  ];

  /**
   * Accordion toggling
   */
  const [openGroups, setOpenGroups] = useState(['Kibana']);

  // Save which groups are open and which are not with state and local store
  const toggleAccordion = (isOpen: boolean, title?: string) => {
    if (!title) return;
    const itExists = openGroups.includes(title);
    if (isOpen) {
      if (itExists) return;
      openGroups.push(title);
    } else {
      const index = openGroups.indexOf(title);
      if (index > -1) {
        openGroups.splice(index, 1);
      }
    }
    setOpenGroups([...openGroups]);
    localStorage.setItem('openNavGroups', JSON.stringify(openGroups));
  };

  /**
   * Pinning
   */
  const [pinnedItems, setPinnedItems] = useState<
    EuiPinnableListGroupItemProps[]
  >([]);

  const addPin = (item: EuiPinnableListGroupItemProps) => {
    if (!item || find(pinnedItems, { label: item.label })) {
      return;
    }
    item.pinned = true;
    const newPinnedItems = pinnedItems ? pinnedItems.concat(item) : [item];
    setPinnedItems(newPinnedItems);
    localStorage.setItem('pinnedItems', JSON.stringify(newPinnedItems));
  };

  const removePin = (item: EuiPinnableListGroupItemProps) => {
    const pinIndex = findIndex(pinnedItems, { label: item.label });
    if (pinIndex > -1) {
      item.pinned = false;
      const newPinnedItems = pinnedItems;
      newPinnedItems.splice(pinIndex, 1);
      setPinnedItems([...newPinnedItems]);
      localStorage.setItem('pinnedItems', JSON.stringify(newPinnedItems));
    }
  };

  function alterLinksWithCurrentState(
    links: EuiPinnableListGroupItemProps[],
    showPinned = false
  ): EuiPinnableListGroupItemProps[] {
    return links.map(link => {
      const { pinned, ...rest } = link;
      return {
        pinned: showPinned ? pinned : false,
        ...rest,
      };
    });
  }

  function addLinkNameToPinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Pin ${listItem.label} to top`;
  }

  function addLinkNameToUnpinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Unpin ${listItem.label}`;
  }

  const collapsibleNavId = useGeneratedHtmlId({ prefix: 'collapsibleNav' });

  const collapsibleNav = (
    <EuiCollapsibleNav
      ownFocus={false}
      css={css`
        margin-top: 96px; // two top navs
        min-height: calc(100vh - 96px);
        display: flex;
      `}
      id={collapsibleNavId}
      aria-label="Main navigation"
      isOpen={navIsOpen}
      button={
        <EuiHeaderSectionItemButton
          aria-label="Toggle main navigation"
          onClick={() => setNavIsOpen(!navIsOpen)}>
          <EuiIcon type={'menu'} size="m" aria-hidden="true" />
        </EuiHeaderSectionItemButton>
      }
      onClose={() => setNavIsOpen(false)}>
      {/* Dark deployments section */}

      {/* Shaded pinned section always with a home item */}
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup background="dark"></EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="none" />
      {/* Menu items */}
      <EuiFlexItem className="">
        <EuiCollapsibleNavGroup
          title={
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={e => e.stopPropagation()}>
              Dashboards
            </a>
          }
          buttonElement="div"
          iconType="logoKibana"
          isCollapsible={true}
          initialIsOpen={openGroups.includes('Kibana')}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Kibana')}>
          <EuiPinnableListGroup
            aria-label="Kibana" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(KibanaLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiFlexItem className="">
        <EuiCollapsibleNavGroup
          title={
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={e => e.stopPropagation()}>
              Security
            </a>
          }
          buttonElement="div"
          iconType="logoSecurity"
          isCollapsible={true}
          initialIsOpen={true}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Kibana')}>
          <EuiPinnableListGroup
            aria-label="Kibana" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(SecurityLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiFlexItem className="">
        <EuiCollapsibleNavGroup
          title={
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={e => e.stopPropagation()}>
              Deployments
            </a>
          }
          buttonElement="div"
          iconType="logoCloud"
          isCollapsible={true}
          initialIsOpen={true}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Kibana')}>
          <EuiPinnableListGroup
            aria-label="Kibana" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(SecurityLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
    </EuiCollapsibleNav>
  );

  const leftSectionItems = [collapsibleNav];

  return (
    <>
      <EuiHeader
        theme="dark"
        position="fixed"
        sections={[
          {
            items: [
              <EuiHeaderLogo
                key="elastic-logo"
                iconType="logoElasticStack"
                href={`/`}></EuiHeaderLogo>,
              <a href="/" className="logo">
                KubeOBS
              </a>,
            ],
            borders: 'none',
          },
          {
            items: [
              <ThemeSwitcher key={useGeneratedHtmlId()} />,
              <EuiHeaderSectionItemButton
                key={useGeneratedHtmlId()}
                aria-label="Account menu">
                <EuiAvatar name="User" size="s" />
              </EuiHeaderSectionItemButton>,
            ],
            borders: 'none',
          },
        ]}
      />

      <EuiHeader
        position="fixed"
        sections={[
          {
            items: leftSectionItems,
            borders: 'right',
          },
          {
            items: [
              <EuiHeaderSectionItemButton
                key={useGeneratedHtmlId()}
                aria-label="Cluster Selector">
                <ClusterSelector />
              </EuiHeaderSectionItemButton>,
            ],
            breadcrumbs: breadcrumbs,
            borders: 'right',
          },
        ]}
      />
    </>
  );
};

export default CollapsibleNav;
