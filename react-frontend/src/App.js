import React from 'react'
import {Layout} from 'antd'
import MainMenu from './MainMenu'
import 'antd/dist/antd.css'
import './App.css'
import SocialGraph from "./SocialGraph"
import axios from 'axios';
import UserData from './UserData'
import LocationHeatmap from './LocationHeatmap'
import {Route} from "react-router";



let existingPoints = {}


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'relations',
            points: []
        }
    }

    componentWillMount() {
        axios.get('http://gr-esports.de:8080/ts3/users').then(res => {
             let points = [];
             for (let i = 0; i < res.data.length; i++) {
                 points.push({
                     lng: res.data[i].location.longitude,
                     lat: res.data[i].location.latitude,
                     weight: 1
                 })
             }

             console.log('points', points)

             this.setState({
                 points: this.spread(points)
             }, () => console.log('points', this.state.points));
        });
    }

    exists = point => existingPoints[`${point.lat},${point.lng}`] === 1

    addPoint = (points, point) => {

        if (this.exists(point)) {
            console.log('points', point)
            console.log('points', true)
            this.addPoint(points, {
                lng: point.lng + Math.pow(10, -2),
                lat: point.lat + Math.pow(10, -2),
                weight: point.weight
            })
        } else {
            console.log('points', false)
            points.push(point)
            existingPoints[`${point.lat},${point.lng}`] = 1
        }
    }

    evaluate = points => {
        let evaluatedPoints = []

        for (let i = 0; i < points.length; i++) {
            console.log('points', evaluatedPoints.length)
            this.addPoint(evaluatedPoints, points[i])
        }

        return evaluatedPoints
    }

    spread = points => {
        let spreadPoints = []
        points.forEach(point => {
            spreadPoints.push({
                lat: point.lat + Math.pow(10, -2) * (Math.random() - 0.5),
                lng: point.lng + Math.pow(10, -2) * (Math.random() - 0.5),
                weight: point.weight
            })
        })
        return spreadPoints
    }

    handleMenuClick(e) {
        console.log(e);
        this.setState({
            current: e.key
        });
    }


    render() {
        return(
            <Layout>
                <Layout.Sider breakpoint='md' width={210} style={{background: '#ffffff', padding: 0}}>
                    <MainMenu handleChange={this.handleMenuClick.bind(this)} />
                </Layout.Sider>
                <Layout.Content className='content' >
                    <Route path='/' exact component={() => <div className='graph'><SocialGraph /></div>}/>
                    <Route path='/user-data' exact component={UserData}/>
                    <Route path='/heatmap' exact component={() => <div className='graph'><LocationHeatmap
                        points={this.state.points}
                        radiusInM={10000}/></div>}/>
                </Layout.Content>
            </Layout>
        );
    }
}
