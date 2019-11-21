import React, { Component } from 'react';
import './Forum.css';
import axios from 'axios';
import { getTodaysDate } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';

const todayDate = getTodaysDate();

class Forum extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forumPosts: [],
            activePost: null,
            makingPost: false,
            newPostTitle: '',
            newPostText: '',
        };

        this.onPost = this.onPost.bind(this);
    }

    async componentDidMount() {
        const forumPosts = (await axios.get(`/forumPosts`)).data;
        this.setState({ forumPosts });
    }

    async onPost(event) {
        event.preventDefault();
        const newPost = { title: this.state.newPostTitle, body: this.state.newPostText, userid: this.props.user.id, username: this.props.user.firstname, postdate: todayDate };
        await axios.post('/forum', newPost);
        const forumPosts = (await axios.get(`/forumPosts`)).data;
        this.setState({ forumPosts, newPostTitle: '', newPostText: '', makingPost: false });
    }

    render() {
        return(
            <div className="forum-body">
                <div className="post-list">
                    <Button onClick={() => this.setState({ makingPost: true })}>+ New Post</Button>
                    <Modal id="new-post" size="lg" show={this.state.makingPost} onHide={() => this.setState({makingPost: false})}>
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
                        <ActivePost post={this.state.activePost} user={this.props.user} />
                    ) : (<p>Select a post to view, or create your own!</p>) }
                </div>
            </div>
        );
    }
}

function Post(props) {
        return(
            <div className="post-preview" onClick={props.onClick}>
                <h5>{ props.post.title }</h5>
                <h6>{ props.post.username }</h6>
                <p>{ props.post.body.slice(0, 25) }</p>
            </div>
        );
};

class ActivePost extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            comments: [],
            newCommentText: "",
        }

        this.onReply = this.onReply.bind(this);
    }

    async componentDidMount() {
        await this.props.post;
        const comments = (await axios.get(`commentsByPost/${this.props.post.id}`)).data;
        this.setState({ comments });
    }

    async componentWillUpdate() {
        const comments = (await axios.get(`commentsByPost/${this.props.post.id}`)).data;
        this.setState({ comments });
    }

    async onReply(event) {
        event.preventDefault();
        const reply = {
            body: this.state.newCommentText, 
            userid: this.props.user.id, 
            postid: this.props.post.id, 
            username: `${this.props.user.firstname} ${this.props.user.lastname}`, 
            commentdate: todayDate
        };
        await axios.post(`/comment`, reply);
        const comments = (await axios.get(`commentsByPost/${this.props.post.id}`)).data;
        this.setState({ comments, newCommentText: "" });
    }

    render() {
        return (
            <div className="active-container">
                <div className="active-post">
                    <h3>{this.props.post.title}</h3>
                    <p>{this.props.post.body}</p>
                    <p className="author-info">{`${this.props.post.username}, ${this.props.post.postdate}`}</p>
                </div>
                <div className="post-replies">
                    <h4>Comments:</h4>
                    {this.state.comments.map((comment) => {
                        return (
                            <div className="comment-block">
                                <p>{comment.body}</p>
                                <p className="author-info">{`${comment.username}, ${comment.postdate}`}</p>
                            </div>
                        )
                    })}
                </div>
                <div className="reply-container">
                    <Form onSubmit={this.onReply}>
                        <Form.Row>
                            <Col><Form.Control value={this.state.newCommentText} onChange={(event) => this.setState({ newCommentText: event.target.value })} /></Col>
                            <Col><Button type="submit">Reply</Button></Col>
                        </Form.Row>
                    </Form>
                </div>
            </div>
        );
    }
}

export { Forum };