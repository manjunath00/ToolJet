import React from 'react';
import usePinnedPopover from '@/_hooks/usePinnedPopover';
import { LeftSidebarItem } from './SidebarItem';
import { SidebarPinnedButton } from './SidebarPinnedButton';
import JSONTreeViewer from '@/_ui/JSONTreeViewer';
import _ from 'lodash';
import { allSvgs } from '@tooljet/plugins/client';

export const LeftSidebarInspector = ({ darkMode, currentState, appDefinition }) => {
  const [open, trigger, content, popoverPinned, updatePopoverPinnedState] = usePinnedPopover(false);

  const jsontreeData = { ...currentState };
  delete jsontreeData.errors;

  const componentDefinitions = JSON.parse(JSON.stringify(appDefinition))['components'];

  const queryIcons = Object.entries(currentState['queries']).map(([key, value]) => {
    const Icon = allSvgs[value.kind];
    return { iconName: key, jsx: () => <Icon style={{ height: 16, width: 16, marginRight: 12 }} /> };
  });

  const componentIcons = Object.entries(currentState['components']).map(([key, value]) => {
    const component = componentDefinitions[value.id]['component'];

    if (component.name === key) {
      return {
        iconName: key,
        iconPath: `/assets/images/icons/widgets/${component.displayName.toLowerCase()}.svg`,
        className: 'component-icon',
      };
    }
  });

  const iconsList = [
    { iconName: 'queries', iconPath: '/assets/images/icons/editor/left-sidebar/queries.svg' },
    { iconName: 'components', iconPath: '/assets/images/icons/editor/left-sidebar/components.svg' },
    { iconName: 'globals', iconPath: '/assets/images/icons/editor/left-sidebar/globals.svg' },
    { iconName: 'variables', iconPath: '/assets/images/icons/editor/left-sidebar/variables.svg' },
    ...queryIcons,
    ...componentIcons,
  ];

  return (
    <>
      <LeftSidebarItem
        tip="Inspector"
        {...trigger}
        icon="inspect"
        className={`left-sidebar-item left-sidebar-layout ${open && 'active'} left-sidebar-inspector`}
        text={'Inspector'}
      />
      <div
        {...content}
        className={`card popover ${open || popoverPinned ? 'show' : 'hide'}`}
        style={{ resize: 'horizontal', maxWidth: '60%', minWidth: '312px' }}
      >
        <SidebarPinnedButton
          darkMode={darkMode}
          component={'Inspector'}
          state={popoverPinned}
          updateState={updatePopoverPinnedState}
        />
        <div style={{ marginTop: '1rem' }} className="card-body">
          <JSONTreeViewer data={jsontreeData} useIcons={true} iconsList={iconsList} />
        </div>
      </div>
    </>
  );
};
