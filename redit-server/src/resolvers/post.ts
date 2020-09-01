import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }
  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    //2 sequel queries
    return Post.create({ title }).save();
  }
  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== undefined) {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<Boolean> {
    await Post.delete(id);

    return true;
  }
}
