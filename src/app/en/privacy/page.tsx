'use client';

import { useTranslations } from 'next-intl';
import { Box, Container, Flex, Heading, Text, Separator } from '@radix-ui/themes';
import ContainerLayout from '@/components/globals/ContainerLayout';
import pageProvider from '@/providers/PageProvider';
import useAlerts from '@/hooks/useAlerts';

const SECTION_KEYS = [
  'canvas',
  'imageProcessor',
  'diagrams',
  'directflow',
  'directflowDocs',
  'analytics',
  'contact',
] as const;

function PrivacyContent() {
  const t = useTranslations('privacy');

  return (
    <Container size="3" px="4">
      <Flex direction="column" gap="6" pb="9">
        <Box>
          <Heading size="7" mb="1">{t('title')}</Heading>
          <Text size="2" color="gray">{t('lastUpdated')}</Text>
        </Box>

        <Text size="3" color="gray">{t('intro')}</Text>

        <Separator size="4" />

        {SECTION_KEYS.map((key) => (
          <Box key={key}>
            <Heading size="4" mb="2">{t(`sections.${key}.title`)}</Heading>
            <Text size="2" color="gray" style={{ lineHeight: 1.7 }}>
              {t(`sections.${key}.body`)}
            </Text>
          </Box>
        ))}
      </Flex>
    </Container>
  );
}

export default function PrivacyPage() {
  const { alert, resetAlert, setAlertContentType } = useAlerts();

  return (
    <pageProvider.Provider value={{ pageName: 'privacy', ...alert, resetAlert, setAlertContentType }}>
      <ContainerLayout pageName="privacy">
        <PrivacyContent />
      </ContainerLayout>
    </pageProvider.Provider>
  );
}
