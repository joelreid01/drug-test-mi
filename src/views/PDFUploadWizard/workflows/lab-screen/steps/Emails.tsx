'use client'

import { useEffect, useState } from 'react'
import { withForm } from '@/blocks/Form/hooks/form'
import { useStore } from '@tanstack/react-form'
import { getLabScreenFormOpts } from '../shared-form'
import { useLabScreenEmailPreview } from '../../components/emails/useLabScreenEmailPreview'
import { EmailsFieldGroup } from '../../components/emails/EmailsFieldGroup'
import type { SubstanceValue } from '@/fields/substanceOptions'

export const EmailsStep = withForm({
  ...getLabScreenFormOpts('emails'),

  render: function Render({ form }) {
    const [showReferralPreview, setShowReferralPreview] = useState(false)

    // Get typed form values
    const formValues = useStore(form.store, (state) => state.values)

    // Use lab screen email preview hook
    // Note: medications and breathalyzer info are automatically fetched from the matched test
    const {
      data: previewData,
      isLoading,
      error,
    } = useLabScreenEmailPreview({
      testId: formValues?.matchCollection?.testId,
      testType: formValues?.labScreenData?.testType,
      detectedSubstances: (formValues?.labScreenData?.detectedSubstances || []) as SubstanceValue[],
      isDilute: formValues?.labScreenData?.isDilute || false,
    })

    // Initialize form fields when preview data loads
    useEffect(() => {
      if (previewData) {
        // Initialize client email if available and not yet set
        if (previewData.clientEmail && formValues.emails.clientRecipients.length === 0) {
          form.setFieldValue('emails.clientEmailEnabled', true)
          form.setFieldValue('emails.clientRecipients', [previewData.clientEmail])
        }
        // Initialize referral emails if not yet set
        if (previewData.referralEmails.length > 0 && formValues.emails.referralRecipients.length === 0) {
          form.setFieldValue('emails.referralEmailEnabled', true)
          form.setFieldValue('emails.referralRecipients', previewData.referralEmails)
        }
      }
    }, [previewData, formValues.emails.clientRecipients.length, formValues.emails.referralRecipients.length, form])

    return (
      <EmailsFieldGroup
        form={form}
        fields="emails"
        previewData={previewData || null}
        isLoading={isLoading}
        error={error?.message || null}
        showPreview={showReferralPreview}
        setShowPreview={setShowReferralPreview}
        showClientEmail={true}
        title="Review Screening Notification Emails"
        description="Configure email recipients for lab screening results"
      />
    )
  },
})
