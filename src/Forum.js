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
        this.onEdit = this.onEdit.bind(this);
        this.getPosts = this.getPosts.bind(this);
    }

    async componentDidMount() {
        const forumPosts = await this.getPosts();
        this.setState({ forumPosts });
    }

    async onPost() {
        const newPost = { title: this.state.newPostTitle, body: this.state.newPostText, userid: this.props.user.id, username: this.props.user.firstname, postdate: todayDate };
        await axios.post('/forum', newPost);
        const forumPosts = await this.getPosts();
        this.setState({ forumPosts, newPostTitle: '', newPostText: '', makingPost: false });
    }

    async onEdit(postId, titleText, postText) {
        const post = {
            title: titleText,
            body: postText,
        }

        await axios.put(`/forum/${postId}`, post);
        const forumPosts = await this.getPosts();
        const activePost = (await axios.get(`/forum/${postId}`)).data[0];
        this.setState({ forumPosts, activePost });
    }

    async getPosts() {
        const allPosts = (await axios.get(`/forumPosts`)).data;        
        const forumPosts = [];
        for (const post of allPosts) {
            const classId = (await axios.get(`/user/${post.userid}`)).data[0].classid;
            if (classId === this.props.user.classid) {
                forumPosts.push(post);
            }
        }

        return forumPosts;
    }

    render() {
        let dates = [];

        return(
            <div className="forum-body">
                <div className="sidebar">
                    <div className="post-button">
                        <Button onClick={() => this.setState({ makingPost: true })}>+ New Post</Button>
                        <Modal id="new-post" size="lg" show={this.state.makingPost} onHide={() => this.setState({makingPost: false})}>
                            <Modal.Header>
                                <Modal.Title>New Post:</Modal.Title>
                            </Modal.Header>
                            <Form onSubmit={(event) => {
                                event.preventDefault()
                                this.setState({makingPost: false});
                                this.onPost();
                            }}>
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
                    </div>
                    <br />
                    <div className="post-list">
                        {this.state.forumPosts.map((post) => {
                            let date = null ;
                            if (!dates.includes(post.postdate)) {
                                date = <h4>{post.postdate}</h4>;
                                dates.push(post.postdate);
                                return (
                                    <div key={post.id} className="post-date">
                                        { date }
                                        <Post date={date} post={post} onClick={() => this.setState({ activePost: post })} />
                                    </div>
                                )
                            }

                            return (
                                <Post key={post.id} date={date} post={post} onClick={() => this.setState({ activePost: post })} />
                            )
                        })}
                    </div>
                </div>
                <div className="active-container">
                    { this.state.activePost ? (
                        <ActivePost post={this.state.activePost} user={this.props.user} onEdit={this.onEdit} />
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
                <p>{ props.post.body.length > 62 ? `${props.post.body.slice(0, 62)}...` : props.post.body }</p>
            </div>
        );
};

class ActivePost extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            comments: [],
            newCommentText: "",
            titleText: "",
            postText: "",
            editing: false
        }

        this.onReply = this.onReply.bind(this);
    }

    async componentDidMount() {
        await this.props.post;

        if (this.props.post) {
            const comments = (await axios.get(`commentsByPost/${this.props.post.id}`)).data;
            this.setState({ 
                comments,
                titleText: this.props.post.title,
                postText: this.props.post.body,
            });
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.post.id !== this.props.post.id) {
            this.setState({ editing: false })
        }
        const comments = (await axios.get(`commentsByPost/${this.props.post.id}`)).data;
        this.setState({ 
            comments,
            titleText: this.props.post.title,
            postText: this.props.post.body,
        });
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
        const viewMode = (
            <div className="active-post">
                <h3>{this.props.post.title}</h3>

                <p>{this.props.post.body}</p>
                <p className="author-info">{`${this.props.post.username}, ${this.props.post.postdate}`}</p>
                { this.props.user.id === this.props.post.userid ? <Button onClick={() => this.setState({ editing: true })} >Edit Post</Button> : null }
            </div>
        );

        const editMode = (
            <div className="active-post">
                <Form onSubmit={(event) => {
                    event.preventDefault();
                    this.props.onEdit(this.props.post.id, this.state.titleText, this.state.postText);
                    this.setState({ editing: false });
                }}>
                    <Form.Row>
                        <Col><Form.Control value={this.state.titleText} onChange={(event) => this.setState({ titleText: event.target.value })} /></Col>
                    </Form.Row>
                    <Form.Row>
                        <Col><Form.Control as="textarea" rows="5" value={this.state.postText} onChange={(event) => this.setState({ postText: event.target.value })} /></Col>
                    </Form.Row>
                    <Form.Row>
                        <Col><Button type="submit">Save Changes</Button></Col>
                    </Form.Row>
                </Form> 
            </div>
        )

        return (
            <div >
                {this.state.editing ? editMode : viewMode}
                <div className="post-replies">
                    <h4>Comments:</h4>
                    {this.state.comments.map((comment) => {
                        return (
                            <div className="comment-block" key={comment.id}>
                                <p>{comment.body}</p>
                                <p className="author-info">{`${comment.username}, ${comment.commentdate}`}</p>
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