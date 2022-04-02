import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const placeHolder =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='

  
  const Image = styled.img`
  display: inline;
  height: 200px;
  width: 200px;
  // Add a smooth animation on loading
  @keyframes loaded {
    0% {
      opacity: 0.1;
    }
    100% {
      opacity: 1;
    }
  }
  // I use utilitary classes instead of props to avoid style regenerating
  &.loaded:not(.has-error) {
    animation: loaded 300ms ease-in-out;
  }
  &.has-error {
    // fallback to placeholder image on error
    content: url(${placeHolder});
  }
`

const SmallImage = styled.img`
  display: inline;
  height: 100px;
  width: 100px;
  // Add a smooth animation on loading
  @keyframes loaded {
    0% {
      opacity: 0.1;
    }
    100% {
      opacity: 1;
    }
  }
  // I use utilitary classes instead of props to avoid style regenerating
  &.loaded:not(.has-error) {
    animation: loaded 300ms ease-in-out;
  }
  &.has-error {
    // fallback to placeholder image on error
    content: url(${placeHolder});
  }
`

export const LazyImage = ({ nft, src, small, shuffle, alt }) => {
  const [imageSrc, setImageSrc] = useState(placeHolder)
  const [imageRef, setImageRef] = useState()
  const [errorCount, setErrorCount] = useState(0)
  const navigate = useNavigate();

  const onLoad = (event) => {
    event.target.classList.add('loaded')
  }

  const shuffleHover = (shuff) =>{
    if(shuffle){
      console.log("hover")
      console.log(shuff)
    }
    
  }

  const shuffleUnhover = () =>{
    if(shuffle){
      console.log("unhover")
    }
   
  }

  const onError = (event) => {
    if(errorCount > 200){
      event.target.classList.add('has-error')
      setErrorCount(0)
    }else{
      if(src !== imageSrc){
        setImageSrc(src)
      }else{
        imageRef.src = imageSrc
      setErrorCount(errorCount + 1)
      } 
    }
    
  }
  const gotoAsset = () =>{
    if(nft){
      navigate(`/asset/${nft.index}`)
    }else if(shuffle){
      console.log(shuffle)
      navigate(`/shuffle/${shuffle.sellerAddress}`)
    }
    

  }
  useEffect(() =>{
    //setImageSrc(src)
  }, [])

  useEffect(() => {
    let observer
    let didCancel = false

    if (imageRef && imageSrc !== src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src)
                observer.unobserve(imageRef)
              }
            })
          },
          {
            threshold: 0.01,
            rootMargin: '75%',
          }
        )
        observer.observe(imageRef)
      } else {
        // Old browsers fallback
        setImageSrc(src)
        
      }
    }
    return () => {
      didCancel = true
      // on component cleanup, we remove the listner
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef)
      }
    }
  }, [src, imageSrc, imageRef])
  return (
    <div>
    {small ? 
      <SmallImage
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      onDoubleClick={gotoAsset}
    />
    :
    <Image
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      onDoubleClick={gotoAsset}
      onMouseEnter={()=>shuffleHover(shuffle)} 
      onMouseLeave={shuffleUnhover}
    />
  
  }
  </div>
    
  )
}
export default LazyImage;