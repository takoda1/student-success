import React, { Component } from 'react';
import './Forum.css';
import axios from 'axios';
import { getTodaysDate } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import auth0Client from './Auth';
import config from './auth_config.json';

const todayDate = getTodaysDate();

class Forum extends Component {
    constructor(props) {
        super(props);

        this.state = {
            forumPosts: [],
            activePost: null,
            makingPost: false,
            makingNote: false,
            newPostTitle: '',
            newPostText: '',
            selectedView: this.props.user.classid,
            classList: [],
            privateNoteUsers: [],
            // can be changed by Admin only:
            selectedClass: this.props.user.classid,
        };

        this.onPost = this.onPost.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.getPosts = this.getPosts.bind(this);
    }

    async componentDidMount() {
        const classList = (await axios.get('/classes')).data;
        const forumPosts = await this.getPosts(this.state.selectedView);
        const notes = await this.getPosts(-1);
        const privateNoteUsers = [];
        for (const n of notes) {
            if (!privateNoteUsers.includes(n.username))  {
                privateNoteUsers[privateNoteUsers.length] = n.username;
            }
        }
        this.setState({ classList, forumPosts, privateNoteUsers });
        window.gtag('event', 'Page View', {
            'event_category': 'Forum',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
        });
    }

    async onPost(isAdmin) {
        // if Admin, this is an announcement
        const title = isAdmin ? "Announcement: " + this.state.newPostTitle : this.state.newPostTitle;
        const newPost = { title, body: this.state.newPostText, userid: this.props.user.id, username: `${this.props.user.firstname} ${this.props.user.lastname}`, postdate: todayDate, classid: this.state.selectedClass };
        const recipients = (await axios.get('/users')).data.filter((user) => user.classid === this.state.selectedClass).map((ob) => ob.email);
        await axios.post('/forum', newPost);

        // Send email notification to class members
        if (isAdmin) {
            const message = {
                recipients,
                subject: "Your Instructor has posted a new Announcement", // Subject line
                messageHtml: `<h4>${this.state.newPostTitle}</h4>
                                <p>${this.state.newPostText}</p>
                                </br>
                                <p>Visit <a href="https://student-success.herokuapp.com/forum">here</a> to view the post.</p>
                             `, // html body
            }

            await axios.post('/send', message); // Send the email!
        }

        const forumPosts = await this.getPosts(this.state.selectedView);
        this.setState({ forumPosts, newPostTitle: '', newPostText: '', makingPost: false });
    }

    async onEdit(postId, titleText, postText) {
        const post = {
            title: titleText,
            body: postText,
        }

        await axios.put(`/forum/${postId}`, post);
        const forumPosts = await this.getPosts(this.state.selectedView);
        const activePost = (await axios.get(`/forum/${postId}`)).data[0];
        this.setState({ forumPosts, activePost });
    }

    async getPosts(classCode) {
    
        // Forum Posts with classCode as classid
        // Private notes have classCode == -1
        let forumPosts = (await axios.get(`/forumPosts/${classCode}`)).data;        

        // Users should only see their private posts
        if (classCode === -1 && (auth0Client.getProfile()[config.roleUrl] !== 'admin')) {
            forumPosts = forumPosts.filter((post) => post.userid === this.props.user.id);
        }
        return forumPosts;
    }

    render() {
        let dates = [];
        const isAdmin = auth0Client.getProfile()[config.roleUrl] === 'admin';

        return (
            <div className="forum-body">
                <div className="sidebar">
                    <div className="post-button">
                        <Button onClick={() => this.setState({ makingPost: true })}>{isAdmin ? '+ New Announcement' : '+ New Post'}</Button>
                        { isAdmin ? null : <Button onClick={() => this.setState({ makingNote: true, selectedClass: -1 })}>+ Instructor Note</Button> }

                        <Modal id="new-post" size="lg" show={this.state.makingPost} onHide={() => this.setState({makingPost: false})}>
                            <Modal.Header>
                                <Modal.Title>New Post:</Modal.Title>
                            </Modal.Header>
                            <Form onSubmit={async (event) => {
                                event.preventDefault()
                                this.setState({makingPost: false});
                                await this.onPost(isAdmin);
                            }}>
                                {isAdmin ? (<Form.Row>
                                    <Form.Label>Class: </Form.Label>
                                    <Form.Control as="select" onChange={(event) => {
                                        event.preventDefault();
                                        // Use regex to find classid, e.g. "My Class (3)"
                                        const matches = event.target.value.match(/\(-?([0-9]+)\)/);
                                        const idValue = parseInt(matches[0].slice(1, matches[0].length - 1));
                                        this.setState({ selectedClass: idValue })
                                    }} >
                                        <option key={0}>Select... (0)</option>
                                        {this.state.classList.map((c) => <option key={c.id}>{`${c.classname} (${c.id})`}</option>)}
                                    </Form.Control>
                                </Form.Row>) : null}
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

                        <Modal id="new-note" size="lg" show={this.state.makingNote} onHide={() => this.setState({ makingNote: false, selectedClass: this.props.user.classid })}>
                            <Modal.Header>
                                <Modal.Title>New Private Post:</Modal.Title>
                            </Modal.Header>
                            <Form onSubmit={async (event) => {
                                event.preventDefault()
                                console.log(this.state.selectedClass);
                                await this.onPost(isAdmin);
                                this.setState({
                                    makingNote: false,
                                    selectedClass: this.props.user.classid
                                })
                            }}>
                                <Form.Row>
                                    <Form.Label>Subject: </Form.Label>
                                    <Form.Control value={this.state.newPostTitle} onChange={(event) => this.setState({ newPostTitle: event.target.value })} />
                                </Form.Row>
                                <Form.Row>
                                    <Form.Label>Body: </Form.Label>
                                    <Form.Control value={this.state.newPostText} onChange={(event) => this.setState({ newPostText: event.target.value })} />
                                </Form.Row>
                                <Button variant="primary" type="submit">Post</Button>
                                <Button variant="secondary" onClick={() => this.setState({ makingNote: false, selectedClass: this.props.user.classid })}>
                                    Cancel
                                </Button>
                            </Form>
                        </Modal>

                        <Form onSubmit={async (event) => {
                            event.preventDefault();
                            const forumPosts = await this.getPosts(this.state.selectedView);
                            this.setState({ forumPosts }); // selectedView: chosenView });
                        }}>
                            <Form.Label>View: </Form.Label>
                            <Form.Control as="select" onChange={(event) => {
                                event.preventDefault();
                                // Use regex to find classid, e.g. "My Class (3)"
                                const matches = event.target.value.match(/\(-?([0-9]+)\)/);
                                const idValue = parseInt(matches[0].slice(1, matches[0].length - 1));
                                this.setState({ selectedView: idValue })
                            }} >
                                <option key={0}>Select... (0) </option>
                                <option key={-1}>Instructor Notes (-1)</option>
                                {isAdmin ? this.state.classList.map((c) => <option key={c.id}>{`${c.classname} (${c.id})`}</option>) 
                                    : <option key={this.props.user.classid}>My Class ({this.props.user.classid})</option>}
                            </Form.Control>
                            <Button type="submit">Change View</Button>
                        </Form>
                        {(isAdmin && this.state.selectedView === -1) ? (
                            <Form onSubmit={async (event) => {
                                event.preventDefault();
                                let forumPosts = await this.getPosts(-1);
                                forumPosts = (this.state.filter === "View All") ? forumPosts :
                                    (this.state.filter === "View Today's Posts") ? forumPosts.filter((post) => post.postdate === todayDate) :
                                    forumPosts.filter((post) => this.state.filter === post.username);
                                this.setState({ forumPosts });
                            }}>
                                <Form.Label>Filter: </Form.Label>
                                <Form.Control as="select" onChange={(event) => {
                                    event.preventDefault();
                                    this.setState({ filter: event.target.value });
                                }} >
                                    <option key={-1}>View All</option>
                                    <option key={0}>View Today's Posts</option>
                                    {this.state.privateNoteUsers.map((username) => <option key={username}>{username}</option>)}
                                </Form.Control>
                                <Button type="submit">Submit</Button>
                            </Form>
                        ) : null}
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

        // If Private note, send email notification
        console.log(this.props.post);
        if (this.props.post.classid === -1) {             
            const isAdmin = auth0Client.getProfile()[config.roleUrl] === 'admin';
            const recipients = [];
            recipients.push(isAdmin ? (await axios.get(`/user/${this.props.post.userid}`)).data[0].email : this.props.user.email);
            
            const message = {
                recipients,
                subject: `New Comment on a Private Note`, // Subject line
                messageHtml: `<h4>Your Note "${this.state.titleText}" has a new comment</h4>
                                <p>${reply.username}: ${this.state.newCommentText}</p>
                                </br>
                                <p>Visit <a href="https://student-success.herokuapp.com/forum">here</a> and select Instructor Notes to view the post.</p>
                             `, // html body
            }

            await axios.post('/send', message); // Send the email!
        }


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