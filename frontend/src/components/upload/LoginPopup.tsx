import React, {FormEvent, ChangeEvent, useState, useContext} from 'react';
import {toast} from "react-toastify";
import {Button, Form, Modal} from "react-bootstrap";
import {AuthContext } from '../../auth/AuthProvider';

interface UserCredentials {
    username: string;
    password: string;
}

interface LoginPopupProps {
    show: boolean;
    handleShow: () => void;
    handleClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ show, handleShow, handleClose }) => {
    const [credentials, setCredentials] = useState<UserCredentials>({ username: '', password: '' });
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext is undefined");
    }

    const { setIsLoggedIn } = authContext;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (data.success) {
            handleClose();

            toast.success('Login successful!', {
                position: toast.POSITION.TOP_RIGHT
            });

            const user = { name: credentials.username };
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            setIsLoggedIn(true);

            setTimeout(() => {
                window.location.href = '/upload';
            }, 1000);
        } else {
            toast.error('Login unsuccessful. Please try again.', {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    }

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                required={true}
                                value={credentials.username}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Password"
                                required={true}
                                value={credentials.password}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default LoginPopup;
