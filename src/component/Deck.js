import React, {Component} from 'react';
import {
    View, 
    Animated,
    PanResponder,
    Dimensions,
    StyleSheet,
    LayoutAnimation,
    UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHHOLD = 0.25 * SCREEN_WIDTH;

class Deck extends Component {
    static defaultProps = {
        onSwipeRight : () => {},
        onSwipeLeft: () => {}
    }

    constructor(props){
        super(props);
        
        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx , y:gesture.dy});
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHHOLD) {
                    this.foreceSwipe('right');
                }else if (gesture.dx <  -SWIPE_THRESHHOLD) {
                    this.foreceSwipe('left');
                }else {
                    this.resetPosition();
                }
            }
        });
        this.state = {panResponder, position, index:0};
    }

    componentWillReceiveProps(next) {
        if (next.data != this.props.data) {
            this.setState({index:0});
        }
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    foreceSwipe = (direction) => {

        const x =  direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.timing(this.state.position,{
            toValue : {x, y: 0},
            duration: 250
        }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete=(direction) => {
        const {onSwipeRight, onSwipeLeft, data} = this.props;
        console.log(this.state.index, 'state');
        
        const item = data[this.state.index];
        console.log(item);
        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);  
        this.state.position.setValue({ x: 0, y: 0 });
        this.setState({ index: this.state.index + 1 });
   }

    resetPosition= () => {
        Animated.spring(this.state.position, {
            toValue : {x: 0, y:0}
        }).start();
    }

    getCardStyle= () => {

         const {position} = this.state;
         const rotate = position.x.interpolate({
             inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
         });
        return {
            ...position.getLayout(),
            transform : [{rotate}]
        };  
    }

    renderCard  () {

        if (this.state.index >= this.props.data.length) {
            return this.props.renderEmptyCard();
        }

        return this.props.data.map((item, i) => {
            if (i < this.state.index) {
                return null;
            }
            if ( i ===  this.state.index) { 
                return ( 
                    <Animated.View
                        key={item.id}
                        style={[this.getCardStyle(), {
                            position: 'absolute',
                            width: SCREEN_WIDTH}]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
            return (
                <Animated.View 
                    key={item.id} 
                    style={[styles.cardStyle, {top: 10 * (i - this.state.index)}]}
                >
                    {this.props.renderCard(item)}
                </Animated.View>
            )
        }).reverse();
    }
    render() {
        return ( 
            <View>
                {this.renderCard()}
           </View>
        );
    }
}

const styles = StyleSheet.create({
    cardStyle : {
        position: 'absolute',
        zIndex: 1,
        width: SCREEN_WIDTH
    }
});


export default Deck;