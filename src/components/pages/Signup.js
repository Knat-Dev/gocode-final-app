import React, { useState, useEffect, useRef } from 'react';
import {
    makeStyles,
    Button,
    FormControl,
    Paper,
    Typography,
    TextField,
    Fade,
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
        height: '90vh',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyItems: 'center',
    },
}));

function Signup({ history }) {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
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

        firebase
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
        window.confirmationResult
            .confirm(verificationId)
            .then(function (result) {
                // User signed in successfully.
                var user = result.user;
                user.getIdToken().then((idToken) => {
                    console.log(idToken);
                });
            })
            .catch(function (error) {
                // User couldn't sign in (bad verification code?)
                console.error(
                    'Error while checking the verification code',
                    error
                );
                window.alert(
                    'Error while checking the verification code:\n\n' +
                        error.code +
                        '\n\n' +
                        error.message
                );
            });
    };

    return (
        <div className={classes.app}>
            {transitions.map(({ item, key, props }) =>
                item ? (
                    <animated.div style={props}>
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
                                <Typography variant="h5" align="center">
                                    Enter The Code
                                </Typography>
                            </FormControl>
                            <FormControl margin="dense" fullWidth>
                                <Button>RESEND</Button>
                            </FormControl>
                            <FormControl margin="normal">
                                <ReactCodeInput
                                    onChange={setOtp}
                                    type="text"
                                    fields={6}
                                />
                            </FormControl>
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
                    <animated.div style={props}>
                        <Paper
                            elevation={3}
                            style={{
                                padding: 55,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 304,
                            }}
                        >
                            <form onSubmit={handleSendCode}>
                                <FormControl
                                    fullWidth
                                    style={{ marginBottom: 15 }}
                                >
                                    <Typography align="center" variant="h5">
                                        Phone Registration
                                    </Typography>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        label="Email"
                                        placeholder="Enter your email address"
                                    />
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        value={nickname}
                                        onChange={(e) =>
                                            setNickname(e.target.value)
                                        }
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                        label="Nickname"
                                        placeholder="Enter your desired nickname"
                                    />
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
                                        onChange={(phone) =>
                                            setPhone('+' + phone)
                                        }
                                    />
                                </FormControl>
                                <FormControl margin="normal">
                                    <div id="recaptcha" />
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
                                        onClick={handleSendCode}
                                    >
                                        Send Code
                                    </Button>
                                </FormControl>
                            </form>
                        </Paper>
                    </animated.div>
                )
            )}
        </div>
    );
}

export default Signup;
