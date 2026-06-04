import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
const OtpVerify =
  Platform.OS === 'android' ? require('react-native-otp-verify').default : null;

type Props = {
  phone: string;
  setCode: (code: string) => void;
  submit: (phone: string, code: string) => void;
  enabled?: boolean;
};

export function useSmsAutoFillNative({
  phone,
  setCode,
  submit,
  enabled = true,
}: Props) {
  const submitRef = useRef(submit);
  const setCodeRef = useRef(setCode);
  const phoneRef = useRef(phone);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);
  useEffect(() => {
    setCodeRef.current = setCode;
  }, [setCode]);
  useEffect(() => {
    phoneRef.current = phone;
  }, [phone]);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') {
      return;
    }

    OtpVerify.getOtp()
      .then(result => {
        OtpVerify.addListener((message: string) => {
          const match = message.match(/\d{4,6}/);
          if (match?.[0]) {
            const code = match[0];
            setCodeRef.current(code);
            submitRef.current(phoneRef.current, code);
            OtpVerify.removeListener();
          }
        });
      })
      .catch(err => console.warn('OTP Verify error:', err));

    return () => {
      OtpVerify.removeListener();
    };
  }, [enabled]);
}
