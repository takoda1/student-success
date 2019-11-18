import React, { Component } from 'react';
import './Forum.css';
import axios from 'axios';
import { getTodaysDate } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const today = getTodaysDate();

class Forum extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forumPosts: [],
            activePost: null,
            makingPost: false,
            newPostTitle: '',
            newPostText: '',
            newCommentText: '',
        };

        this.onPost = this.onPost.bind(this);
    }

    async componentDidMount() {
        const forumPosts = (await axios.get(`/forumPosts`)).data;
        this.setState({ forumPosts });
    }

    async onPost(event) {
        event.preventDefault();
        const newPost = { title: this.state.newPostTitle, body: this.state.newPostText, userid: this.props.user.id, username: this.props.user.firstname, postdate: today };
        await axios.post('/forum', newPost);
        const forumPosts = (await axios.get(`/forumPosts`)).data;
        this.setState({ forumPosts, newPostTitle: '', newPostText: '', makingPost: false });
    }

    render() {
        return(
            <div className="forum-body">
                <div className="post-list">
                    <Button onClick={() => this.setState({ makingPost: true })}>+ New Post</Button>
                    <Modal show={this.state.makingPost} onHide={() => this.setState({makingPost: false})}>
                        <Modal.Header>
                            <Modal.Title>New Post:</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={this.onPost}>
                            <Form.Row>
                                <Form.Label>Title: </Form.Label>
                                <Form.Control value={this.state.newPostTitle} onChange={(event) => this.setState({ newPostTitle: event.target.value })} />
                            </Form.Row>
                            <Form.Row>
                                <Form.Label>Body: </Form.Label>
                                <Form.Control value={this.state.newPostText} onChange={(event) => this.setState({ newPostText: event.target.value })} />
                            </Form.Row>
                            <Button variant="primary" type="submit">Post</Button>
                            <Button variant="secondary" onClick={() => this.setState({makingPost: false})}>
                                Cancel
                            </Button>
                        </Form>
                    </Modal>
                    {this.state.forumPosts.map((post) => <Post key={post.id} post={post} onClick={(e) => this.setState({ activePost: post })} />)}
                </div>
                <div className="active-container">
                    { this.state.activePost ? (
                        <ActivePost post={this.state.activePost} />
                    ) : (<p>Select a post to view, or create your own!</p>) }
                </div>
            </div>
        );
    }
}

class Post extends Component {

    render() {
        return(
            <div className="post-preview" onClick={this.props.onClick}>
                <h5>{ this.props.post.title }</h5>
                <h6>{ this.props.post.username }</h6>
                <p>{ this.props.post.body.slice(0, 25) }</p>
            </div>
        );
    }
}

class ActivePost extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            comments: [],
        }
    }

    async componentDidMount() {

    }

    render() {
        return (
            <div className="active-container">
                <div className="active-post">
                    <h3>{this.props.post.title}</h3>
                    <p>{this.props.post.body}</p>
                </div>
                <div className="post-replies">
                    {this.state.comments.map((comment) => <p>TODO</p>)}
                </div>
            </div>
        );
    }
}

export { Forum };