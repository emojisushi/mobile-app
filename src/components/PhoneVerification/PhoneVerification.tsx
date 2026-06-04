import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Controller, Control, UseFormTrigger} from 'react-hook-form';

import {CheckBox, Input} from '~/components';
import {nh, nw} from '~/common/normalize.helper';
import {useSmsVerification} from '../../Screens/Cart/Screens/CartScreen/hooks/useSmsVerification';

type Props = {
  control: Control<any>;
  phone: string;
  city_slug: string;
  enabled: boolean;
  trigger: UseFormTrigger<any>;
  onPhoneConfirmedChange?: (confirmed: boolean) => void;
  error: string | undefined;
  checkboxEnabled?: boolean;
  prefetch?: boolean;
  setCode?: (code: string) => void;
};

export const PhoneVerification = ({
  control,
  phone,
  city_slug,
  enabled,
  trigger,
  onPhoneConfirmedChange,
  error,
  checkboxEnabled = true,
  prefetch = true,
  setCode,
}: Props) => {
  const {
    phoneConfirmed,
    smsCode,
    setSmsCode,
    error: smsError,
    sendSms,
    verifySms,
    sendSmsLoading,
    verifySmsLoading,
    smsCooldown,
    isCheckCodeButtonDisabled,
  } = useSmsVerification({
    phone,
    city_slug,
    enabled,
    prefetch,
  });

  useEffect(() => {
    onPhoneConfirmedChange?.(!!phoneConfirmed);
    setCode?.(smsCode);
  }, [onPhoneConfirmedChange, phoneConfirmed, setCode, smsCode]);

  return (
    <Controller
      name="dontCall"
      control={control}
      render={({field: {onChange, value}}) => (
        <View style={styles.container}>
          {checkboxEnabled && (
            <View style={styles.row}>
              <CheckBox active={value} onChange={onChange} />
              <Text style={styles.whiteText}>Не передзвонювати</Text>
            </View>
          )}
          {checkboxEnabled && error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          <View style={{marginTop: nh(10)}}>
            {phoneConfirmed ? (
              <Text style={styles.confirmedText}>Телефон підтверджено</Text>
            ) : (
              <>
                <Text style={styles.greyText}>Підтвердіть номер телефону</Text>

                <Input
                  value={smsCode}
                  onChangeText={setSmsCode}
                  error={smsError ?? ''}
                  placeholder="Введіть отриманий код"
                  inputMode="numeric"
                  otp
                />

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (smsCooldown > 0 || sendSmsLoading) && styles.disabled,
                    ]}
                    disabled={smsCooldown > 0 || sendSmsLoading}
                    onPress={async () => {
                      const isValid = await trigger('phone');
                      if (!isValid) {
                        return;
                      }

                      sendSms();
                    }}>
                    <Text style={styles.blackText}>
                      {smsCooldown > 0
                        ? `Надіслано (${smsCooldown})`
                        : 'Отримати смс'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      (verifySmsLoading || isCheckCodeButtonDisabled) &&
                        styles.disabled,
                    ]}
                    disabled={verifySmsLoading || isCheckCodeButtonDisabled}
                    onPress={verifySms}>
                    <Text style={styles.blackText}>Надіслати код</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: nw(365),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: nh(10),
  },
  whiteText: {
    color: 'white',
    fontSize: nh(14),
  },
  greyText: {
    color: '#616161',
    fontSize: nh(14),
    marginBottom: nh(8),
  },
  confirmedText: {
    color: '#4CAF50',
    fontSize: nh(14),
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: nh(10),
  },
  button: {
    width: '48%',
    height: nh(45),
    backgroundColor: '#FFE600',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  blackText: {
    color: 'black',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: nh(13),
    marginTop: nh(5),
  },
});
