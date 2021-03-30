import React from 'react';
import styled from '@emotion/styled';
import {withTheme} from 'emotion-theming';
import moment from 'moment-timezone';

import FileSize from 'app/components/fileSize';
import TimeSince from 'app/components/timeSince';
import Tooltip from 'app/components/tooltip';
import {IconClock} from 'app/icons';
import {t, tct} from 'app/locale';
import space from 'app/styles/space';
import {BuiltinSymbolSource} from 'app/types/debugFiles';
import {
  CandidateDownloadStatus,
  ImageCandidate,
  ImageCandidateUnApplied,
} from 'app/types/debugImage';
import {Theme} from 'app/utils/theme';

import {getSourceTooltipDescription} from '../utils';

import Features from './features';

type Props = {
  candidate: ImageCandidate;
  builtinSymbolSources: Array<BuiltinSymbolSource> | null;
  isInternalSource: boolean;
  eventDateCreated: string;
  theme: Theme;
};

function Information({
  candidate,
  builtinSymbolSources,
  isInternalSource,
  eventDateCreated,
  theme,
}: Props) {
  const {source_name, source, location, download} = candidate;

  function getMainInfo() {
    if (candidate.download.status === CandidateDownloadStatus.UNAPPLIED) {
      const {symbolType, filename} = candidate as ImageCandidateUnApplied;

      return symbolType === 'proguard' && filename === 'proguard-mapping'
        ? null
        : filename;
    }

    if (location && !isInternalSource) {
      return location;
    }

    return null;
  }

  function getExtraDescriptions() {
    if (candidate.download.status !== CandidateDownloadStatus.UNAPPLIED) {
      return null;
    }

    const {
      symbolType,
      fileType,
      cpuName,
      size,
      dateCreated,
    } = candidate as ImageCandidateUnApplied;

    const uploadedBeforeEvent = moment(dateCreated).isBefore(eventDateCreated);

    const relativeTime = uploadedBeforeEvent
      ? tct('This debug file was uploaded [when] before this event.', {
          when: moment(eventDateCreated).from(dateCreated, true),
        })
      : tct('This debug file was uploaded [when] after this event.', {
          when: moment(dateCreated).from(eventDateCreated, true),
        });

    return (
      <DescriptionItem>
        <ExtraDetails>
          <span>
            {symbolType === 'proguard' && cpuName === 'any'
              ? t('proguard mapping')
              : `${cpuName} (${symbolType}${fileType ? ` ${fileType}` : ''})`}
          </span>
          <TimeAndSizeWrapper>
            <TimeWrapper color={uploadedBeforeEvent ? theme.orange300 : theme.error}>
              <IconClock size="xs" />
              <TimeSince
                date={dateCreated}
                tooltipTitle={<RelativeTime>{relativeTime}</RelativeTime>}
              />
            </TimeWrapper>
            {' | '}
            <FileSize bytes={size} />
          </TimeAndSizeWrapper>
        </ExtraDetails>
      </DescriptionItem>
    );
  }

  return (
    <Wrapper>
      {getMainInfo()}
      <Descriptions>
        <DescriptionItem>
          <Tooltip title={getSourceTooltipDescription(source, builtinSymbolSources)}>
            <strong>{`${t('Source')}: `}</strong>
            {source_name ?? t('Unknown')}
          </Tooltip>
        </DescriptionItem>
        {getExtraDescriptions()}
      </Descriptions>
      <Features download={download} />
    </Wrapper>
  );
}

export default withTheme(Information);

const Wrapper = styled('div')`
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 100%;
`;

const Descriptions = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
  color: ${p => p.theme.subText};
`;

const DescriptionItem = styled('div')``;

const ExtraDetails = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  > * :first-child {
    padding-right: ${space(3)};
  }
`;

const TimeAndSizeWrapper = styled('div')`
  display: inline-grid;
  grid-template-columns: repeat(3, max-content);
  grid-gap: ${space(0.25)};
  align-items: center;
`;

const TimeWrapper = styled('div')<{color?: string}>`
  display: grid;
  grid-gap: ${space(0.5)};
  grid-template-columns: min-content 1fr;
  align-items: center;
  ${p => p.color && `color: ${p.color}`}
`;

const RelativeTime = styled('div')`
  padding-bottom: ${space(0.5)};
`;
