export default class VideoProcessor {
    #mp4Demuxer
    /**
     *
     * @param {object} options
     * @param {import('./mp4Demuxer.js').default} options.mp4Demuxer
     */
    constructor({mp4Demuxer}) {
        this.#mp4Demuxer = mp4Demuxer;
    }

    /**
     *
     * @param encoderConfig
     * @param stream
     * @returns {ReadableStream}
     */
    mp4Decoder(encoderConfig,stream){
        return new ReadableStream(
            {
                 start: async (controller)=> {
                    const decoder = new VideoDecoder(
                        {
                            error(e){
                                console.error('Error decoder mp4',e);
                                controller.error(e);
                            },
                            /**
                             * @param {VideoFrame} frame
                             */
                            output(frame){
                                controller.enqueue(frame);
                            }
                        }
                    )
                    return this.#mp4Demuxer.run(stream,
                        {
                            onConfig(config){
                                decoder.configure(config)
                            },
                            /**
                             *
                             * @param {EncodedVideoChunk} chunk
                             */
                            onChunk(chunk){
                                decoder.decode(chunk)
                            },
                        }
                    ).then(()=>{
                        //TODO refactory next class
                        setTimeout(()=>{
                            controller.close()
                        },1000)
                    })
                },
            }
        )
    }

    async start({file, encoderConfig, renderFrame}){
        const stream = file.stream();
        await this.mp4Decoder(encoderConfig, stream)
            .pipeTo(new WritableStream({
                write(frame){
                  renderFrame(frame)
                }
            }))
    }

}