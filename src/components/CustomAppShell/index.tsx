import { AppShell, Burger, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { PropsWithChildren } from 'react';
import Test from '../../Test';

type CustomAppShellProps = PropsWithChildren;

const CustomAppShell: React.FC<CustomAppShellProps> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 0,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header p={'md'} style={{ display: 'flex', alignItems: 'center' }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title>Podcast</Title>
        <Test />
      </AppShell.Header>

      {/* <AppShell.Navbar p="md"></AppShell.Navbar> */}

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default CustomAppShell;
