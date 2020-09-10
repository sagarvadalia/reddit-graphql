import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  title!: string;
  @Field()
  @Column()
  creatorId: number;
  @Field()
  @Column({ default: '' })
  text!: string;
  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;
  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}
