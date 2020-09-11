import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    Button,
    FormControl,
    Paper,
    Typography,
} from '@material-ui/core';
import { useTransition, animated } from 'react-spring';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import firebase from '../../firebase/firebase';
import ReactCodeInput from 'react-code-input';

//TODO: https://stackoverflow.com/questions/58368775/reactjs-firebase-auth-phone-sign-up-flow

const useStyles = makeStyles((theme) => ({
    app: {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        [theme.breakpoints.down('xs')]: {
            height: 'calc(100vh - 56px)',
        },
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

function Login() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errors, setErrors] = useState([]);
    const classes = useStyles();

    const transitions = useTransition(isVerifying, null, {
        from: { position: 'absolute', opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });

    useEffect(() => {
        window.appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha');
        const appVerifier = window.appVerifier;
        appVerifier.render();
    }, []);

    const handleSendCode = (e) => {
        e.preventDefault();
        const appVerifier = window.appVerifier;

        return firebase
            .auth()
            .signInWithPhoneNumber(phone, appVerifier)
            .then(function (confirmationResult) {
                console.log('Success');
                window.confirmationResult = confirmationResult;
                setIsVerifying(true);
                setErrors([]);
            })
            .catch(function (error) {
                const _errors = {};
                if (error.code === 'auth/too-many-requests')
                    _errors.general =
                        'Too many request, wait a few minutes and try again.';
                setErrors(_errors);
                console.log('Error:' + error.code);
            });
    };

    const onVerifyCodeSubmit = () => {
        const verificationId = otp;
        console.log(otp);
        window.confirmationResult
            .confirm(verificationId)
            .then(function (result) {
                // User signed in successfully.
                const user = result.user;
                console.log(user.uid);
                console.log(user.displayName);
            })
            .catch(function (error) {
                // User couldn't sign in (bad verification code?)
                console.error(
                    'Error while checking the verification code',
                    error
                );
                const _errors = {};

                if (error.code === 'auth/invalid-verification-code')
                    _errors.general = "The code you've entered is invalid";
                else if (error.code === 'auth/code-expired')
                    _errors.general =
                        'The code has expired, click the resend button';
                if (Object.keys(_errors).length !== 0) setErrors(_errors);
            });
    };

    useEffect(() => {
        if (otp.length === 6) {
            const verificationId = otp;
            console.log(otp);
            window.confirmationResult
                .confirm(verificationId)
                .then(function (result) {
                    // User signed in successfully.
                    const user = result.user;
                    console.log(user.uid);
                    console.log(user.displayName);
                })
                .catch(function (error) {
                    // User couldn't sign in (bad verification code?)
                    console.error(
                        'Error while checking the verification code',
                        error
                    );
                    const _errors = {};

                    if (error.code === 'auth/invalid-verification-code')
                        _errors.general = "The code you've entered is invalid";
                    else if (error.code === 'auth/code-expired')
                        _errors.general =
                            'The code has expired, click the resend button';
                    if (Object.keys(_errors).length !== 0) setErrors(_errors);
                });
        }
    }, [otp]);

    return (
        <div className={classes.app}>
            {transitions.map(({ item, key, props }) =>
                item ? (
                    <animated.div key={key} style={props}>
                        <Paper
                            elevation={3}
                            style={{
                                padding: 30,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 304,
                            }}
                        >
                            <FormControl margin="normal">
                                <Typography
                                    variant="h5"
                                    align="center"
                                    color="primary"
                                >
                                    Enter The Code
                                </Typography>
                            </FormControl>

                            <FormControl margin="normal">
                                <ReactCodeInput
                                    onChange={(text) => {
                                        setOtp(text);
                                    }}
                                    type="text"
                                    fields={6}
                                />
                            </FormControl>
                            {errors.general && (
                                <FormControl fullWidth margin="normal">
                                    <Typography
                                        variant="body1"
                                        color="error"
                                        align="center"
                                    >
                                        {errors.general}
                                    </Typography>
                                </FormControl>
                            )}
                            <FormControl margin="normal" fullWidth>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => onVerifyCodeSubmit()}
                                >
                                    VERIFY
                                </Button>
                            </FormControl>
                        </Paper>
                    </animated.div>
                ) : (
                    <animated.div key={key} style={props}>
                        <Paper
                            variant="outlined"
                            style={{
                                padding: 55,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 304,
                            }}
                        >
                            <FormControl fullWidth style={{ marginBottom: 15 }}>
                                <Typography
                                    align="center"
                                    variant="h5"
                                    color="primary"
                                >
                                    Phone Login
                                </Typography>
                            </FormControl>

                            <FormControl margin="normal">
                                <PhoneInput
                                    placeholder="+972 123 456 789"
                                    onlyCountries={[
                                        'il',
                                        'us',
                                        'ca',
                                        'de',
                                        'fr',
                                    ]}
                                    containerStyle={{ width: 304 }}
                                    searchStyle={{
                                        margin: 'auto',
                                        width: '98%',
                                    }}
                                    dropdownStyle={{ width: 304 }}
                                    inputStyle={{ width: 304 }}
                                    country="il"
                                    enableSearch
                                    value={phone}
                                    onChange={(phone) => setPhone('+' + phone)}
                                />
                            </FormControl>
                            <div style={{ width: 304, minHeight: 76 }}>
                                <div id="recaptcha" />
                            </div>

                            {errors.general && (
                                <FormControl fullWidth margin="normal">
                                    <Typography
                                        variant="body1"
                                        color="error"
                                        align="center"
                                    >
                                        {errors.general}
                                    </Typography>
                                </FormControl>
                            )}
                            <FormControl margin="normal" fullWidth>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={handleSendCode}
                                >
                                    Send Code
                                </Button>
                            </FormControl>
                        </Paper>
                    </animated.div>
                )
            )}
        </div>
    );
}

export default Login;
