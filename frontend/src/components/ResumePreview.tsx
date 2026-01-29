import React from 'react';
import type { ResumeData } from '../types';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { SidebarTemplate } from './templates/SidebarTemplate';

interface ResumePreviewProps {
    data: ResumeData;
    templateId?: string;
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>((props, ref) => {
    const { data, templateId = 'modern' } = props;

    // We wrap the template in a forwardRef compatible div if needed, 
    // but better to pass the ref down or wrap the return.
    // Since react-to-print needs the ref on the container that gets printed:

    return (
        <div ref={ref}>
            {templateId === 'modern' ? (
                <ModernTemplate data={data} />
            ) : templateId === 'classic' ? (
                <ClassicTemplate data={data} />
            ) : templateId === 'sidebar' ? (
                <SidebarTemplate data={data} />
            ) : (
                <ModernTemplate data={data} />
            )}
        </div>
    );
});

