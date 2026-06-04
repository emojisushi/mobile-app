import {useCallback, useEffect, useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useSmsAutoFillNative} from './useSmsAutoFill';
import {
  phoneStatusQuery,
  phoneStatusQueryLogin,
} from '~/Screens/Cart/phoneStatus.query';
import {agent} from '~/../APIClient';

interface PhoneStatusResponse {
  confirmed: boolean;
}

interface UseSmsVerificationProps {
  phone: string;
  city_slug: string;
  enabled?: boolean;
  prefetch?: boolean;
}

export const useSmsVerification = ({
  phone,
  enabled = true,
  prefetch = true,
}: UseSmsVerificationProps) => {
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsVerified, setSmsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isCheckCodeButtonDisabled, setIsCheckCodeButtonDisabled] =
    useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const {data: phoneStatusData, refetch: refetchStatus} = useQuery({
    ...phoneStatusQuery(phone),
    enabled: prefetch && enabled && phone.length > 0,
    staleTime: 1000 * 60,
    retry: false,
  });

  useEffect(() => {
    return () => {
      if (!prefetch) {
        queryClient.removeQueries({queryKey: ['phone-status-login', phone]});
        setSmsVerified(false);
      }
    };
  }, [prefetch, phone, queryClient]);

  const sendSmsMutation = useMutation({
    mutationFn: ({phone}: {phone: string}) => agent.generateCodeMobile({phone}),
    onSuccess: () => {
      setTimer(75);
      setSmsSent(true);
      setError(null);
      setIsCheckCodeButtonDisabled(false);
    },
    onError: () => setError(''),
    retry: false,
  });

  useEffect(() => {
    setSmsSent(false);
    setSmsCode('');
    setSmsVerified(false);
    setError(null);
    setTimer(0);
    setIsCheckCodeButtonDisabled(true);
  }, [phone]);

  const verifySmsMutation = useMutation({
    mutationFn: ({phone, smsCode}: {phone: string; smsCode: string}) =>
      agent.verifyCode({phone, code: smsCode}),
    onSuccess: () => {
      setTimer(0);
      setSmsVerified(true); // always set local state
      setError(null);
      if (prefetch) {
        refetchStatus(); // only refetch when prefetch=true
      }
    },
    onError: () => {
      setSmsVerified(false);
      setError('Невірний код');
    },
    retry: 1,
  });

  const sendSms = () => {
    if (timer > 0) return;
    sendSmsMutation.mutate({phone});
  };
  const verifySms = () => verifySmsMutation.mutate({phone, smsCode});
  const verifySmsWithCode = useCallback(
    (phone: string, code: string) => {
      verifySmsMutation.mutate({phone, smsCode: code});
    },
    [phone, verifySmsMutation],
  );

  useSmsAutoFillNative({
    phone,
    setCode: setSmsCode,
    submit: verifySmsWithCode,
    enabled: enabled,
  });
  const phoneConfirmed = prefetch ? phoneStatusData?.confirmed : smsVerified;
  return {
    phoneConfirmed,
    isPhoneStatusLoading: false,
    smsSent,
    smsCode,
    setSmsCode,
    smsVerified,
    error,
    setError,
    sendSms,
    verifySms,
    sendSmsLoading: sendSmsMutation.isLoading,
    verifySmsLoading: verifySmsMutation.isLoading,
    smsCooldown: timer,
    isCheckCodeButtonDisabled,
  };
};
