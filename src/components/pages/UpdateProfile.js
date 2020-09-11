import React, { useState } from 'react';
import {
    makeStyles,
    Grid,
    FormControl,
    Paper,
    TextField,
    Typography,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormLabel,
    Button,
} from '@material-ui/core';
import { ContactMailOutlined as ContactMail } from '@material-ui/icons';
import firebase from '../../firebase/firebase';
import md5 from 'md5';

const useStyles = makeStyles((theme) => ({
    container: {
        height: 'calc(100vh - 64px)',
        [theme.breakpoints.down('xs')]: {
            height: 'calc(100vh - 56px)',
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        width: 350,
        padding: 30,
    },
}));

const UpdateProfile = ({ history }) => {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [teacher, setTeacher] = useState('no');
    const [errors, setErrors] = useState({});

    const classes = useStyles();

    const isValidated = () => {
        const _errors = {};
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!email.trim()) _errors.email = 'Must not be empty';
        else if (!re.test(String(email.trim()).toLowerCase()))
            _errors.email = 'Email must be valid';

        if (!nickname.trim()) _errors.nickname = 'Must not be empty';
        else if (nickname.trim().length < 3)
            _errors.nickname = 'Nickname must be at least 3 characters long';

        setErrors(_errors);
        if (Object.keys(_errors).length === 0) return true;
        else return false;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValidated()) {
            const user = firebase.auth().currentUser;
            const uid = user.uid;
            const gravatar = `https://www.gravatar.com/avatar/${md5(
                email
            )}?d=identicon`;
            const userData = {
                uid,
                email,
                nickname,
                avatar: gravatar,
                registration_date: new Date().getTime(),
                teacher: teacher ? true : false,
                admin: false,
            };
            user.updateEmail(email)
                .then(() => {
                    console.log('Updated user email address');
                    return user.updateProfile({
                        displayName: nickname,
                        photoURL: gravatar,
                    });
                })
                .then(() => {
                    console.log('Updated user displayName');
                    return firebase
                        .firestore()
                        .collection('users')
                        .doc(uid)
                        .set(userData);
                })
                .then(() => {
                    console.log('User was created successfully');
                    history.push('/app');
                });
        }
    };
    return (
        <Grid item className={classes.container}>
            <Paper variant="outlined" className={classes.paper}>
                <form onSubmit={handleSubmit}>
                    <FormControl
                        fullWidth
                        style={{ marginTop: 20, marginBottom: 20 }}
                    >
                        <Grid
                            container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={1}
                        >
                            <Grid item>
                                <ContactMail color="primary" fontSize="large" />
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" color="primary">
                                    Add information
                                </Typography>
                            </Grid>
                        </Grid>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <TextField
                            autoFocus
                            error={errors.email ? true : false}
                            helperText={errors.email}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            placeholder="Please enter your email"
                            label="Email"
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <TextField
                            error={errors.nickname ? true : false}
                            helperText={errors.nickname}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            variant="outlined"
                            placeholder="Please enter your desired nickname"
                            label="Nickname"
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormControl>
                    <FormControl component="fieldset" style={{ marginTop: 15 }}>
                        <FormLabel component="legend">
                            Are you teaching anything?
                        </FormLabel>
                        <RadioGroup
                            aria-label="teacher"
                            name="teacher"
                            value={teacher}
                            onChange={(e) => setTeacher(e.target.value)}
                        >
                            <FormControlLabel
                                value="no"
                                control={<Radio color="primary" />}
                                label="No"
                            />
                            <FormControlLabel
                                value="yes"
                                control={<Radio color="primary" />}
                                label="Yes"
                            />
                        </RadioGroup>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            type="submit"
                        >
                            Update Profile
                        </Button>
                    </FormControl>
                </form>
            </Paper>
        </Grid>
    );
};

export default UpdateProfile;
